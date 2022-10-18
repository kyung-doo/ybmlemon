import io from 'socket.io-client'
import { RecorderConfig } from '@/config'
import MultiStreamsMixer from 'multistreamsmixer'
import ysFixWebmDuration from 'fix-webm-duration'

const
	SERVER_BPS = RecorderConfig.bps.server,
	LOCAL_BPS = RecorderConfig.bps.local,
	SERVER_RECORDER_OPTION = {
		mimeType: (window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8',
		videoBitsPerSecond: 50000
	},
	LOCAL_RECORDER_OPTION = {
		mimeType: (window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8',
		videoBitsPerSecond: RecorderConfig.bitrate.local
	},
	BLOB_OPTION = {
		'type': 'video/webm'
	}


let
	vueEventBus = null,
	vueStore = null,
	socket = null,
	roomId = '',
	sockets = []
	




export const ServerRecorder = {
	stream: null,
	orgStream: null,
	recorder: null,
	isRecording: false,

	startRecord() {
		getUserDisplay().then(( result )=> {

			for(var i = 0; i<100; i++ ) {
				this.connectSocket( i )
						.then((io) => {
							io.once('disconnect', (reason) => {
								if (reason !== 'io client disconnect') {
									// vueEventBus.$emit('recorder:server:disconnet')
									// if (this.stream) {
									// 	this.stopRecord()
									// }
									console.log('~~~~~~~', reason);
								}
							})
							io.emit(`create-file-${io.id}`)
							console.log(io.id)
						})
						.catch((e) => {
							this.disconnect()
							vueEventBus.$emit('recorder:server:failed', new Error(e))
							console.error(e)
					})
			}

			this.stream = result
			this.stream.getVideoTracks()[0].onended = () => {
				this.stopRecord();
			}
			this.recorder = new MediaRecorder(this.stream, SERVER_RECORDER_OPTION);
			this.recorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					for(var i=0; i<sockets.length; i++) {
						if(sockets[i]) {
							sockets[i].emit(`start-record-${sockets[i].id}`, e.data);
						}
					}
				}
			};
			this.recorder.start(1000 / SERVER_BPS);
			this.startTime = Date.now()
			this.isRecording = true
			vueEventBus.$emit('recorder:server:start')
		})
		
	},

	stopRecord() {
		this.recorder.stop();
		this.recorder.ondataavailable = null
		this.stream.getTracks().forEach((track) => {
			track.onended = null
			track.stop();
		})
		if (this.orgStream) {
			this.orgStream.getTracks().forEach((track) => {
				track.onended = null
				track.stop();
			})
		}
		this.stream = null
		this.orgStream = null
		this.disconnect()
		this.isRecording = false
		vueEventBus.$emit('recorder:server:stop')
	},

	connectSocket( idx ) {
		return new Promise((resolve, reject) => {
			sockets[idx] = io.connect(RecorderConfig.server)
			sockets[idx].once('connect', () => {
				sockets[idx].emit(`init-${sockets[idx].id}`, roomId)
				resolve(sockets[idx])
			});

			sockets[idx].once('connect_error', (error) => {
				reject(error)
			});

			sockets[idx].once('connect_failed', (error) => {
				reject(error)
			});
		})
	},

	disconnect() {
		if (sockets.length > 0) {
			for(var i=0; i< sockets.length; i++){
				sockets[i].disconnect();
			}
			sockets = []
		}
	}
}

export const LocalRecorder = {

	chunks: [],
	stream: null,

	recorder: null,
	startTime: 0,
	isRecording: false,
	orgStream: null,
	startRecord() {
		getUserDisplay()
			.then((result) => {
				if (result.getAudioTracks().length > 0) {
					this.orgStream = result
					this.stream = mixStream(result)
				} else {
					this.stream = result
				}
				this.stream.getVideoTracks()[0].onended = () => {
					this.stopRecord();
				}
				this.recorder = new MediaRecorder(this.stream, LOCAL_RECORDER_OPTION);
				this.recorder.ondataavailable = (e) => {
					if (e.data.size > 0) {
						this.chunks.push(e.data)
					}
				};
				this.recorder.start(1000 / LOCAL_BPS);
				this.startTime = Date.now()
				this.isRecording = true
				vueEventBus.$emit('recorder:local:start')
			})
			.catch((e) => {
				vueEventBus.$emit('recorder:local:failed', new Error(e))
				console.error(e)
			})
	},

	stopRecord() {
		this.recorder.stop();
		this.recorder.ondataavailable = null
		this.stream.getTracks().forEach((track) => {
			track.onended = null
			track.stop();
		})
		if (this.orgStream) {
			this.orgStream.getTracks().forEach((track) => {
				track.onended = null
				track.stop();
			})
		}
		this.stream = null
		this.orgStream = null
		const duration = Date.now() - this.startTime;
		const blob = new Blob(this.chunks, BLOB_OPTION)
		ysFixWebmDuration(blob, duration, (fixedBlob) => {
			this.downloadFile(URL.createObjectURL(fixedBlob))
			this.chunks = []
			this.isRecording = false
			vueEventBus.$emit('recorder:local:stop')
		});
	},

	downloadFile(url) {
		const a = document.createElement('a')
		const date = new Date()
		const now = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
		a.style.display = 'none'
		a.href = url
		a.download = `record-${now}.webm`
		a.click()
		window.URL.revokeObjectURL(url)
	}
}


function getUserDisplay() {
	return navigator.mediaDevices.getDisplayMedia({
		video: { width: 1920, height: 1080 },
		audio: true,
		unselected: true
	});
}

function mixStream(stream) {
	const audioStream1 = new MediaStream()
	const audioTracks = vueStore.getters['study/mainStudy/getStream'](vueStore.state.userInfo.type).getAudioTracks()
	audioTracks.forEach((track) => {
		audioStream1.addTrack(track)
	})
	const audioStream2 = new MediaStream()
	stream.getAudioTracks().forEach((track) => {
		audioStream2.addTrack(track)
	})
	const mixAudioStream = new MultiStreamsMixer([audioStream1, audioStream2]).getMixedStream()
	const newStream = new MediaStream()
	stream.getVideoTracks().forEach((track) => {
		newStream.addTrack(track)
	})
	mixAudioStream.getAudioTracks().forEach((track) => {
		newStream.addTrack(track)
	})
	return newStream
}



export default {
	init(eventBus, store) {
		vueEventBus = eventBus
		vueStore = store
		roomId = vueStore.getters['study/mainStudy/getRoomCode']
	},

	destroy() {
		if (ServerRecorder.isRecording) {
			ServerRecorder.stopRecord()
		}
		if (LocalRecorder.isRecording) {
			LocalRecorder.stopRecord()
		}
		vueEventBus = null
		vueStore = null
		socket = null
		roomId = ''
	}
}