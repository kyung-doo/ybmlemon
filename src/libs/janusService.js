
import Janus from "./janus"
import { JanusConfig } from '@/config';
import RecorderService from '@/libs/recorderService'

const
	OPAQUE_ID = Janus.randomString(12),
	MAX_ONE_SEND_DATA = 16000

let
	myRoom,
	userInfo = null,
	isCreator = false,
	vueStore,
	vueEventBus,
	janus = null,
	screenJanus = null,
	myVideoRoom = null,
	myTextRoom = null,
	screenShare = null,
	viewerConfig = null,
	audioMuted = false,
	janusServer = null,
	apiSecret = ''




// 비디오룸 Class
class AttachVideoRoom {

	static create = (remoteInfo = null, isObserver = false) => {
		const attach = new AttachVideoRoom(remoteInfo, isObserver);
		if (!remoteInfo) {
			myVideoRoom = attach
			window.videoRoom = myVideoRoom
		}
		return attach
	}

	constructor(remoteInfo, isObserver) {
		this.handler = null
		this.remoteInfo = remoteInfo
		this.isObserver = isObserver
		this.attach()
	}

	attach() {
		if (!janus) return
		janus.attach({
			plugin: 'janus.plugin.videoroom',
			opaqueId: OPAQUE_ID,
			success: async (pluginHandle) => {
				this.handler = pluginHandle
				Janus.debug('VIDEOROOM :: Plugin attached!', this.handler.getId(), this.handler.getBitrate());
				if (!this.remoteInfo) {
					// 룸 존재 여부
					const { exists } = await sendMessage(this.handler, { request: 'exists', room: myRoom })
					if (!exists) {
						// 없을 경우 생성
						await sendMessage(this.handler, { request: 'create', room: myRoom, pin: myRoom, ...JanusConfig.roomOption })
						isCreator = true
					}
					this.myJoinRoom()
				} else {
					//this.handler.simulcastStarted = false
					Janus.debug("VIDEOROOM :: This is a subscriber", this.remoteInfo);
					this.remoteJoinRoom()
				}
			},

			error: (error) => {
				Janus.error("VIDEOROOM :: -- Error attaching plugin...", error);
				vueEventBus.$emit('janus:error', { type: 'videoroom:local', message: 'AttachPluginFailed' })
			},

			consentDialog: (on) => {
				Janus.debug("VIDEOROOM :: Consent dialog should be " + (on ? "on" : "off") + " now");
			},

			iceState: (state) => {
				Janus.debug("VIDEOROOM :: ICE state changed to " + state);
			},

			mediaState: (medium, on) => {
				Janus.debug("VIDEOROOM :: Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
				// if(!on && medium === 'video') {
				// 	vueStore.dispatch('study/mainStudy/removeStream', userInfo.type)
				// }
			},

			webrtcState: (on) => {
				Janus.debug("VIDEOROOM :: Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
			},

			onmessage: (msg, jsep) => {
				const event = msg.videoroom
				// ============================================= LOCAL MESSAGE ==========================================
				if (!this.remoteInfo) {
					Janus.debug("VIDEOROOM :: LOCAL a message (publisher) :::", msg, jsep);
					switch (event) {
						case 'joined':
							if (!myTextRoom) {
								myTextRoom = new AttachTextRoom()
								window.textRoom = myTextRoom
							}
							this.createOffer()
							AttachVideoRoom.MY_PRIVATE_ID = msg['private_id']
							if (msg["publishers"]) {
								this.createRemoteFeed(msg["publishers"])
							}
							break;
						case 'event':
							if (msg["error"]) {
								Janus.error('VIDEOROOM :: LOCAL error', msg["error"])
								if (msg["error"].indexOf('already exists') > -1) {
									vueEventBus.$emit('janus:error', { type: 'videoroom:local', message: 'AlreadyExists' })
								} else {
									vueEventBus.$emit('janus:error', { type: 'videoroom:local', message: msg["error"] })
								}
							} else if (msg["publishers"]) {
								this.createRemoteFeed(msg["publishers"])
							} else if (msg["leaving"]) {
								const leaving = msg["leaving"];
								Janus.debug("VIDEOROOM :: LOCAL Publisher leaving: " + leaving);
								this.removeRemoteFeed(leaving)
							} else if (msg["unpublished"]) {
								var unpublished = msg["unpublished"];
								Janus.debug("VIDEOROOM :: LOCAL Publisher unpublished: " + unpublished);
								if (unpublished === 'ok') {
									this.handler.hangup();
									return;
								}
								this.removeRemoteFeed(unpublished)
							}
							break;
						case 'destroyed':
							Janus.debug("VIDEOROOM :: The videoroom has been destroyed!");
							vueEventBus.$emit('janus:error', { type: 'videoroom:local', message: 'DestroyedRoom' })
							break;
					}

					if (jsep) {
						Janus.debug("VIDEOROOM :: Handling SDP as well...", jsep);
						this.handler.handleRemoteJsep({ jsep: jsep });
					}
				}
				// ============================================= REMOTE MESSAGE ==========================================
				else {
					Janus.debug("VIDEOROOM :: REMOTE a message (publisher) :::", msg, jsep);
					if (msg["error"]) {
						Janus.error('VIDEOROOM :: REMOTE error', msg["error"]);
						vueEventBus.$emit('janus:error', { type: 'videoroom:remote', message: msg["error"] })
					} else if (event) {
						if (event === 'attached') {
							this.handler.remoteId = msg['id']
							this.handler.remoteDisplay = msg['display']
							AttachVideoRoom.REMOTE_FEEDS[msg['id']] = this.handler
						}
					}
					if (jsep) {
						Janus.debug("VIDEOROOM :: REMOTE Handling SDP as well...", jsep);
						this.handler.createAnswer({
							jsep: jsep,
							media: { audioSend: false, videoSend: false },
							success: async (jsep) => {
								Janus.debug("VIDEOROOM :: REMOTE Got SDP!", jsep);
								await sendMessage(this.handler, { request: "start" }, jsep)
							},
							error: (error) => {
								Janus.error("VIDEOROOM :: REMOTE WebRTC error:", error);
								vueEventBus.$emit('janus:error', { type: 'videoroom:remote', message: 'CreateAnswerError' })
							}
						});
					}
				}
			},

			onlocalstream: (stream) => {
				if (!this.remoteInfo) {
					Janus.debug("VIDEOROOM :: Got a local stream :::", stream)
					vueStore.dispatch('study/mainStudy/setStream', {
						type: userInfo.type,
						stream: stream
					}).then(()=>{
						vueEventBus.$emit('janus:onlocalstream')
						RecorderService.updateStream(stream)
					})
				}
			},

			onremotestream: (stream) => {
				if (this.remoteInfo) {
					Janus.debug("VIDEOROOM :: Got a remote stream :::", stream);
					if (this.remoteInfo.display.indexOf('screenshare') > -1) {
						if (userInfo.type !== 'KT') {
							vueStore.dispatch('study/mainStudy/setStream', {
								type: 'SS',
								stream: stream
							})
						}
					} else {
						vueStore.dispatch('study/mainStudy/setStream', {
							type: this.remoteInfo.display,
							stream: stream
						}).then(()=>{
							vueEventBus.$emit('janus:onremotestream', this.remoteInfo.display)
							RecorderService.updateStream(stream)
						})
					}
				}
			},

			oncleanup: () => {
				Janus.debug("VIDEOROOM :: Got a cleanup notification: we are unpublished now :::");
			}
		})
	}

	myJoinRoom() {
		sendMessage(this.handler, {
			request: "join",
			room: myRoom,
			pin: myRoom,
			id: userInfo.id,
			display: userInfo.type,
			ptype: "publisher"
		})
	}

	remoteJoinRoom() {
		const id = this.remoteInfo['id']
		const display = this.remoteInfo['display']
		const audio_codec = this.remoteInfo['audio_codec']
		const video_codec = this.remoteInfo['video_codec']
		Janus.debug('VIDEOROOM :: remoteJoinRoom', id, this.remoteInfo)
		const subscribe = {
			request: "join",
			room: myRoom,
			pin: myRoom,
			ptype: "subscriber",
			feed: id,
			private_id: AttachVideoRoom.MY_PRIVATE_ID
		};
		if (Janus.webRTCAdapter.browserDetails.browser === "safari" && (video_codec === "vp9" || (video_codec === "vp8" && !Janus.safariVp8))) {
			if (video_codec) {
				video_codec = video_codec.toUpperCase()
			}
			subscribe["offer_video"] = false;
		}
		this.handler.videoCodec = video_codec;
		sendMessage(this.handler, subscribe)
		// remote 비트레이트 확인
		// setInterval(() => {
		//     Janus.debug("REMOTE BITRATE ::", this.handler.getBitrate())
		// }, 1000)
	}

	async createOffer(videoReplace = false, audioReplace = false) {
		let videoOption = {}
		if (viewerConfig.videoInput) {
			videoOption.deviceId = { exact: viewerConfig.videoInput }
		}

		if (viewerConfig.qulity === 'low') {
			videoOption.width = { exact: 320, ideal :  320 }
			videoOption.height = { exact: 240, ideal :  240 }
		} else if (viewerConfig.qulity === 'medium') {
			videoOption.width = { exact: 640, ideal :  640 }
			videoOption.height = { exact: 480, ideal :  480 }
		} else {
			videoOption.width = { exact: 800, ideal :  800 }
			videoOption.height = { exact: 600, ideal :  600 }
		}

		let audioOption = true
		if (audioMuted) {
			audioOption = false
		} else {
			if (viewerConfig.audioInput) {
				audioOption = { deviceId: { exact: viewerConfig.audioInput } }
			}
		}

		var mediaOption = {
			video: videoOption,
			audio: audioOption,
			audioRecv: false,
			videoRecv: false,
			audioSend: !this.isObserver,
			videoSend: !this.isObserver,
			replaceVideo: videoReplace
		}

		if(audioOption) {
			mediaOption.replaceAudio = audioReplace
		} else {
			mediaOption.removeAudio = true
		}
		
		console.log("VIDEOROOM :: Create Offer", mediaOption );
		
		this.handler.createOffer({
			media: mediaOption,
			simulcast: false,
			simulcast2: false,
			success: async (jsep) => {
				let bitrate = 0
				if (viewerConfig.qulity === 'low') {
					bitrate = 240 * 1000
				} else if (viewerConfig.qulity === 'medium') {
					bitrate = 480 * 1000
				} else if(viewerConfig.qulity === 'hign') {
					bitrate = 600 * 1000
				}
				const currentOwner = vueStore.getters['study/mainStudy/getOwner']
				if(currentOwner === 'KT') {
					if(userInfo.type === 'FT') bitrate = 120 * 1000
				} else {
					if(userInfo.type === 'KT') bitrate = 120 * 1000
				}
				
				var publish = { request: "configure", audio: true, video: true, bitrate: bitrate };
				console.log("VIDEOROOM :: Got publisher SDP!", jsep, publish, currentOwner);
				sendMessage(this.handler, publish, jsep)
			},
			error: (error) => {
				Janus.error("VIDEOROOM :: WebRTC error :", error);
				if (error.name === 'NotAllowedError') {
					vueEventBus.$emit('janus:error', { type: 'videoroom:local', message: 'NotAllowedUserMedia' })
				} else {
					vueEventBus.$emit('janus:error', { type: 'videoroom:local', message: error.name || error })
				}
			}
		})


	}

	createRemoteFeed(lists) {
		Janus.debug("VIDEOROOM :: LOCAL Got a list of available publishers/feeds:", lists);
		lists.forEach((list) => {
			if (list.display === 'KT' || list.display === 'FT' || list.display === 'ST' || list.display === 'OB' || list.display.indexOf('screenshare') > -1) {
				//==============================임시=========================================
				// if(list.id === 1111111111 || list.id === 2222222222 || list.id === 3333333333 || list.id === 4444444444 || list.display.indexOf('screenshare') > -1) {
				AttachVideoRoom.create(list)
				// }
			}
		})
	}

	removeRemoteFeed(id) {
		for (let i in AttachVideoRoom.REMOTE_FEEDS) {
			const remoteFeed = AttachVideoRoom.REMOTE_FEEDS[i]
			if (remoteFeed.remoteId === id) {
				Janus.debug("VIDEOROOM :: removeFeed ", remoteFeed);
				remoteFeed.detach()
				if (remoteFeed.remoteDisplay.indexOf('screenshare') > -1) {
					vueStore.dispatch('study/mainStudy/removeStream', 'SS')
				} else {
					vueStore.dispatch('study/mainStudy/removeStream', remoteFeed.remoteDisplay)
				}
				delete AttachVideoRoom.REMOTE_FEEDS[i]
				break
			}
		}
	}
}
AttachVideoRoom.REMOTE_FEEDS = {}
AttachVideoRoom.MY_PRIVATE_ID = ''


// 텍스트룸 Class
class AttachTextRoom {
	constructor() {
		this.handler = null
		this.transactions = {}
		this.chunks = {}
		this.attach()
	}

	attach() {
		if (!janus) return
		janus.attach({
			plugin: 'janus.plugin.textroom',
			opaqueId: OPAQUE_ID,
			success: async (pluginHandle) => {
				Janus.debug('TEXTROOM :: Plugin attached!', pluginHandle);
				this.handler = pluginHandle
				if (isCreator) {
					const { exists } = await sendMessage(this.handler, { request: 'exists', room: myRoom })
					if (!exists) {
						await sendMessage(this.handler, { request: 'create', room: myRoom })
					} else {
						await sendMessage(this.handler, { request: 'destroy', room: myRoom })
						await sendMessage(this.handler, { request: 'create', room: myRoom })
					}
				}
				await sendMessage(this.handler, { request: "setup" })
			},

			error: (error) => {
				Janus.error("TEXTROOM :: Error attaching plugin...", error);
				vueEventBus.$emit('janus:error', { type: 'textroom', message: 'AttachPluginFailed' })
			},

			onmessage: (msg, jsep) => {
				Janus.debug("TEXTROOM :: a message (publisher) :::", msg, jsep);
				if (jsep) {
					this.handler.createAnswer({
						jsep: jsep,
						media: { audio: false, video: false, data: true },
						success: async (jsep) => {
							Janus.debug("TEXTROOM :: Got SDP!");
							await sendMessage(this.handler, { request: "ack" }, jsep)
						},
						error: (error) => {
							Janus.error("TEXTROOM :: WebRTC error:", error);
							vueEventBus.$emit('janus:error', { type: 'textroom', message: error.name })
						}
					})
				}
			},

			ondataopen: (data) => {
				Janus.debug("TEXTROOM :: The DataChannel is available!", data);
				this.joinTextRoom()
			},

			ondata: (data) => {
				Janus.debug("TEXTROOM :: We got data from the DataChannel! " + data);
				const json = JSON.parse(data)
				const transaction = json['transaction']
				if (this.transactions[transaction]) {
					this.transactions[transaction](json);
					delete this.transactions[transaction];
					return;
				}

				const event = json['textroom']
				switch (event) {
					case 'message':
						const obj = JSON.parse(json['text'])
						if (obj.chunk) {
							if (!this.chunks[obj.chunk]) this.chunks[obj.chunk] = ''
							this.chunks[obj.chunk] += obj.data
							if (obj.finish) {
								obj.data = this.chunks[obj.chunk]
								delete obj.chunk
								delete obj.finish
								json['text'] = JSON.stringify(obj)
								vueEventBus.$emit('janus:receiveData', JSON.stringify(json))
							}
						} else {
							vueEventBus.$emit('janus:receiveData', data)
						}
						break;
					case 'join':
						const id = json['display'].split('&')[0]
						if (id === userInfo.id) {
							this.setRoomList('join:my')
						} else {
							this.setRoomList('join:remote')
						}
						break;
					case 'leave':
						this.setRoomList('leave')
						break;
				}
			},

			oncleanup: () => {
				Janus.debug("TEXTROOM :: Got a cleanup notification: we are unpublished now :::");
			}
		})
	}

	async joinTextRoom() {

		const transaction = Janus.randomString(12)
		const register = {
			textroom: "join",
			transaction: transaction,
			room: myRoom,
			username: `${userInfo.id}&${userInfo.name}`,
			display: `${userInfo.id}&${userInfo.type}`
		};

		this.transactions[transaction] = (response) => {
			Janus.debug("TEXTROOM :: TRANSACTION :: ", response)
			if (response['textroom'] === 'error') {
				Janus.error('TEXTROOM :: TRANSACTION Error', response["error"])
				vueEventBus.$emit('janus:error', { type: 'textroom', message: response["error"] })
				return
			}

			if (response.participants && response.participants.length > 0) {
				this.setRoomList('join:remote')
			}
		}
		this.handler.data({ text: JSON.stringify(register) });
	}

	async setRoomList(type) {
		var res = await sendMessage(myTextRoom.handler, { request: "listparticipants", room: myRoom })
		Janus.debug("TEXTROOM :: setRoomList", res.participants)
		if (res.participants && res.participants.length > 0) {
			let response = []
			res.participants.map((list) => {
				const display = list.display.split('&')
				const id = display[0]
				const type = display[1]
				if (id !== userInfo.id && (type === 'KT' || type === 'FT' || type === 'ST' || type === 'OB')) {
					//==============================임시=========================================
					// if(list.username === '김선생' || list.username === '필선생' || list.username === '김학생' || list.username === '옵선생'){
					response.push({ id: id, type: type, name: list.username })
					// }
				}
			})
			vueEventBus.$emit('janus:changeRoomList', { lists: response, type: type })
		}
	}
}


// 화면공유 Class
class AttachScreenShare {

	static create() {
		screenShare = new AttachScreenShare()
		return screenShare;
	}

	constructor() {
		this.handler = null
		this.myId = null
		this.isJoin = false
		this.isPublish = false
		this.attach()
	}

	attach() {
		if (!screenJanus) return
		screenJanus.attach({
			plugin: 'janus.plugin.videoroom',
			opaqueId: OPAQUE_ID,
			success: (pluginHandle) => {
				this.handler = pluginHandle
				Janus.debug('SCREENSHARE :: Plugin attached!', this.handler);
			},

			error: (error) => {
				Janus.error("SCREENSHARE :: Error attaching plugin...", error);
				vueEventBus.$emit('janus:error', { type: 'screenshare', message: 'AttachPluginFailed' })
			},

			consentDialog: (on) => {
				Janus.debug("SCREENSHARE :: Consent dialog should be " + (on ? "on" : "off") + " now")
			},

			iceState: (state) => {
				Janus.debug("SCREENSHARE :: ICE state changed to " + state)
			},

			mediaState: (medium, on) => {
				Janus.debug("SCREENSHARE :: Janus " + (on ? "started" : "stopped") + " receiving our " + medium)
			},

			webrtcState: (on) => {
				Janus.debug("SCREENSHARE :: Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now")
			},

			onmessage: (msg, jsep) => {
				Janus.debug("SCREENSHARE :: ScreenShare a message (publisher) :::", msg, jsep)
				const event = msg.videoroom
				switch (event) {
					case 'joined':
						this.isJoin = true
						this.myId = msg["id"]
						this.createOffer()
						break;
				}
				if (jsep) {
					Janus.debug("SCREENSHARE :: Handling SDP as well...", jsep);
					this.handler.handleRemoteJsep({ jsep: jsep });
				}
			},

			onlocalstream: (stream) => {
				Janus.debug("SCREENSHARE :: Got a ScreenShare local stream :::", stream)
				vueStore.dispatch('study/mainStudy/setStream', {
					type: 'SS',
					stream: stream
				}).then(()=>{
					RecorderService.updateStream(stream)
				})
			},

			oncleanup: () => {
				Janus.debug("SCREENSHARE :: Got a ScreenShare cleanup notification: we are unpublished now :::");
			}
		})
	}

	createOffer() {
		this.handler.createOffer({
			media: { video: 'screen', captureDesktopAudio: true, audioRecv: false, videoRecv: false, videoSend: true, audioSend: true },
			success: async (jsep) => {
				Janus.debug("SCREENSHARE :: Got publisher SDP!", jsep)
				this.isPublish = true
				var publish = { request: "configure", audio: true, video: true }
				await sendMessage(this.handler, publish, jsep)
			},
			error: (error) => {
				Janus.error("SCREENSHARE :: WebRTC error :", error.name);
				if (error.name === 'NotAllowedError') {
					vueEventBus.$emit('janus:error', { type: 'screenshare', message: 'NotAllowedDisplayMedia' })
				} else {
					vueEventBus.$emit('janus:error', { type: 'screenshare', message: error.name })
				}
			}
		})
	}

	async start() {
		if (!this.isJoin) {
			let register = {
				request: "join",
				room: myRoom,
				pin: myRoom,
				display: `${userInfo.id}-screenshare`,
				ptype: "publisher"
			}
			await sendMessage(this.handler, register)
		} else {
			this.createOffer()
		}
	}

	async stop() {
		if (this.isPublish) {
			await sendMessage(this.handler, { request: "unpublish", room: myRoom })
			this.isPublish = false
		}
	}
}


// 세션 생성
function createSession(resolve, reject, isObserver) {
	janus = new Janus({
		server: janusServer,
		apisecret: apiSecret,
		success: () => {
			if (userInfo.type === 'KT') {
				createScreenSession(resolve, reject)
			} else {
				resolve()
			}
			AttachVideoRoom.create(null, isObserver)
		},

		error: (error) => {
			Janus.error('session error', error)
			reject({ message: 'CreateSessionFailed' })
		},

		destroyed() {
			Janus.debug('session destroyed')
		}
	})
}

// KT일경우 화면공유 세션 생성
function createScreenSession(resolve, reject) {
	screenJanus = new Janus({
		server: janusServer,
		apisecret: apiSecret,
		success: () => {
			resolve()
			AttachScreenShare.create()
		},

		error: (error) => {
			Janus.error('session error', error)
			if (screenJanus) {
				screenJanus.destroy({ unload: true, notifyDestroyed: true, cleanupHandles: true })
				screenJanus = null
			}
			reject({ message: 'CreateSessionFailed' })
		},

		destroyed() {
			Janus.debug('session destroyed')
		}
	})
}

// 데이터 전송
function sendData(type, data) {
	return new Promise((resolve, reject) => {
		// console.log('SEND_DATA 데이터 사이즈 :: ', data.length)
		if (data.length > MAX_ONE_SEND_DATA) {
			const chunks = data.match(new RegExp('.{1,' + MAX_ONE_SEND_DATA + '}', 'g'))
			sendDataChuks(resolve, reject, type, chunks, 0, Janus.randomString(12))
			console.log('SEND_DATA LARGE CHUNK 분할 :: ', chunks)
		} else {
			const text = {
				userInfo: userInfo,
				data: data,
				type: type
			}
			const message = {
				textroom: "message",
				transaction: Janus.randomString(12),
				room: myRoom,
				text: JSON.stringify(text)
			}
			console.log('SEND_DATA :: ', message)
			myTextRoom.handler.data({ text: JSON.stringify(message), success: resolve, error: reject })
		}

	})
}

// 데이터 클경우 분할 전송
function sendDataChuks(resolve, reject, type, chunks, index, chunkId, finish = false) {
	const transaction = Janus.randomString(12)
	const text = {
		chunk: chunkId,
		finish: finish,
		userInfo: userInfo,
		data: chunks[index],
		type: type
	}
	const message = {
		textroom: "message",
		transaction: transaction,
		room: myRoom,
		text: JSON.stringify(text)
	}
	myTextRoom.transactions[transaction] = (response) => {
		if (response['textroom'] === 'error') {
			delete myTextRoom.transactions[transaction]
			delete myTextRoom.chunks[chunkId]
			reject()
		} else {
			if (index < chunks.length - 2) {
				sendDataChuks(resolve, reject, type, chunks, index + 1, chunkId)
			} else if (index == chunks.length - 2) {
				sendDataChuks(resolve, reject, type, chunks, index + 1, chunkId, true)
			}
		}
		if (finish) {
			delete myTextRoom.transactions[transaction]
			delete myTextRoom.chunks[chunkId]
			resolve()
		}
	}

	myTextRoom.handler.data({ text: JSON.stringify(message), success: resolve, error: reject })
}

// 메세지 전송
function sendMessage(handler, message, jsep = undefined) {
	return new Promise((resolve, reject) => {
		console.log('SEND_MESSAGE :: ', message)
		handler.send({ message: message, jsep: jsep, success: resolve, error: reject })
	})
}

export default {
	init(room, store, eventBus, server, secret ) {
		myRoom = String(room)
		// myRoom = parseInt(room)
		vueStore = store
		vueEventBus = eventBus
		userInfo = vueStore.getters['getUserInfo']
		viewerConfig = vueStore.getters['study/mainStudy/getConfigs']
		audioMuted = vueStore.getters['study/mainStudy/getMicMuted']
		window.JanusMessage = sendMessage
		window.JanusData = sendData
		
		if(server) {
			janusServer = server
		} else {
			janusServer = JanusConfig.server
		}

		apiSecret = secret

		return new Promise((resolve, reject) => {
			Janus.init({
				debug: JanusConfig.debug, callback: () => {
					if (!Janus.isWebrtcSupported()) {
						reject({ message: 'WebrtcNotSupported' })
						return
					}
					createSession(resolve, reject, userInfo.type === "OT")
				}
			})
		});
	},

	sendData(type, data) {
		if (myTextRoom) {
			sendData(type, data)
		}
	},

	startShareScreen() {
		if (screenShare) {
			screenShare.start()
		}
	},

	stopShareScreen() {
		if (screenShare) {
			screenShare.stop()
		}
	},

	getDeviceLists() {
		return new Promise((resolve, reject) => {
			Janus.listDevices((devices) => {
				resolve(devices)
			});
		})
	},

	setBitrate(qulity) {
		let bitrate = 0
		if(qulity === 'mini') {
			bitrate = 120 * 1000
		} else if (qulity === 'low') {
			bitrate = 240 * 1000
		} else if (qulity === 'medium') {
			bitrate = 480 * 1000
		} else if(qulity === 'high') {
			bitrate = 600 * 1000
		}
		sendMessage(myVideoRoom.handler, { request: 'configure', bitrate: bitrate })
		console.log('change bitrate', qulity, bitrate)
	},

	setInputDevice() {
		viewerConfig = vueStore.getters['study/mainStudy/getConfigs']
		myVideoRoom.createOffer(true, true)
	},

	setAudioMuted(muted) {
		audioMuted = muted
		myVideoRoom.createOffer(false, true)
		console.log('audio muted', muted)
	},

	destroy(studyEnd = false) {
		if (myTextRoom && (vueStore.getters['study/mainStudy/getRoomLists'].length == 0 || studyEnd)) {
			if (myVideoRoom && myVideoRoom.handler) {
				sendMessage(myVideoRoom.handler, { request: 'destroy', room: myRoom, admin_key: JanusConfig.roomOption.admin_key })
			}
			if (myTextRoom && myTextRoom.handler) {
				sendMessage(myTextRoom.handler, { request: 'destroy', room: myRoom, admin_key: JanusConfig.roomOption.admin_key })
			}
			this.destroySession()
		} else {
			this.destroySession()
		}
		if (studyEnd) {
			vueEventBus.$emit('janus:error', { type: 'videoroom:local', message: 'DestroyedRoom' })
		}
		isCreator = false
		userInfo = null
		viewerConfig = null
		janusServer = null
		apiSecret = ''
	},

	destroySession() {
		if (janus) {
			janus.destroy({ unload: true, notifyDestroyed: true, cleanupHandles: true })
			janus = null
			myVideoRoom = null
			myTextRoom = null
			AttachVideoRoom.REMOTE_FEEDS = {}
			AttachVideoRoom.MY_PRIVATE_ID = ''
		}
		if (screenJanus) {
			screenJanus.destroy({ unload: true, notifyDestroyed: true, cleanupHandles: true })
			screenJanus = null
			screenShare = null
		}
	}
}