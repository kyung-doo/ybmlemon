import io from 'socket.io-client'
import { RecorderConfig } from '@/config'
import MultiStreamsMixer from 'multistreamsmixer'
import ysFixWebmDuration from 'fix-webm-duration'

const
	SERVER_BPS = RecorderConfig.bps.server,
	LOCAL_BPS = RecorderConfig.bps.local,
	SERVER_RECORDER_OPTION = {
		mimeType: (window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8',
		videoBitsPerSecond: RecorderConfig.bitrate.server
	},
	LOCAL_RECORDER_OPTION = {
		mimeType: (window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) ? 'video/webm;codecs=vp9' : 'video/webm;codecs=vp8',
		videoBitsPerSecond: RecorderConfig.bitrate.local
	},
	BLOB_OPTION = {
		'type': 'video/webm'
	},

	USER_TYPES = ['KT', 'FT', 'ST', 'SS']


let
	vueEventBus = null,
	vueStore = null,
	socket = null,
	roomId = '',
	recorderServer = null




export const ServerRecorder = {

	socket: null,
	stream: null,
	audioCtx: null,
	audioDest: null,

	recorder: null,
	isRecording: false,

	startRecord() {
		this.connectSocket()
			.then((result) => {
				return getUserDisplay()
			})
			.then((result) => {
				socket.once('disconnect', (reason) => {
					if (reason !== 'io client disconnect') {
						vueEventBus.$emit('recorder:server:disconnet')
						if (this.stream) {
							this.stopRecord()
						}
					}
				})
				socket.emit(`create-file-${socket.id}`)

				this.stream = result
				this.audioCtx = new AudioContext()
				this.audioDest = this.audioCtx.createMediaStreamDestination()

				const videoTrack = this.stream.getVideoTracks()[0];
				videoTrack.onended = () => {
					this.stopRecord();
				}
				this.audioDest.stream.addTrack(videoTrack);
				this.audioCtx.createMediaElementSource(new Audio(createSilentAudio(1))).connect(this.audioDest);

				if(this.stream.getAudioTracks().length > 0){
					this.audioCtx.createMediaStreamSource(this.stream).connect(this.audioDest);
				}

				USER_TYPES.forEach(( type ) => {
					const userStream = vueStore.getters['study/mainStudy/getStream'](type);
					if(userStream && userStream.getAudioTracks().length > 0) {
						this.audioCtx.createMediaStreamSource(userStream).connect(this.audioDest);
					}
				});

				this.recorder = new MediaRecorder(this.audioDest.stream, SERVER_RECORDER_OPTION);
				this.recorder.ondataavailable = (e) => {
					if (e.data.size > 0) {
						socket.emit(`start-record-${socket.id}`, e.data);
					}
				};
				this.recorder.start(1000 / SERVER_BPS);
				this.isRecording = true
				vueEventBus.$emit('recorder:server:start')
			})
			.catch((e) => {
				this.disconnect()
				vueEventBus.$emit('recorder:server:failed', new Error(e))
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
		this.recorder = null
		this.stream = null
		this.audioCtx = null
		this.audioDest = null
		this.disconnect()
		this.isRecording = false
		vueEventBus.$emit('recorder:server:stop')
	},

	connectSocket() {
		return new Promise((resolve, reject) => {
			socket = io.connect(recorderServer)
			socket.once('connect', () => {
				socket.emit(`init-${socket.id}`, roomId)
				resolve()
			});

			socket.once('connect_error', (error) => {
				reject(error)
			});

			socket.once('connect_failed', (error) => { 
				reject(error)
			});
		})
	},

	updateStream ( stream ) {
		if(this.audioCtx && this.audioDest && stream.getAudioTracks().length > 0) {
			this.audioCtx.createMediaStreamSource(stream).connect(this.audioDest);
		}
	},

	disconnect() {
		if (socket) {
			socket.disconnect();
			socket = null
		}
	}
}

export const LocalRecorder = {

	chunks: [],
	stream: null,
	audioCtx: null,
	audioDest: null,

	recorder: null,
	startTime: 0,
	isRecording: false,
	
	startRecord() {
		getUserDisplay()
			.then((result) => {

				// if (result.getAudioTracks().length > 0) {
				// 	this.orgStream = result
				// 	this.stream = mixStream(result)
				// } else {
				// 	this.stream = result
				// }

				this.stream = result
				this.audioCtx = new AudioContext()
				this.audioDest = this.audioCtx.createMediaStreamDestination()

				const videoTrack = this.stream.getVideoTracks()[0];
				videoTrack.onended = () => {
					this.stopRecord();
				}
				this.audioDest.stream.addTrack(videoTrack);
				this.audioCtx.createMediaElementSource(new Audio(createSilentAudio(1))).connect(this.audioDest);

				if(this.stream.getAudioTracks().length > 0){
					this.audioCtx.createMediaStreamSource(this.stream).connect(this.audioDest);
				}

				USER_TYPES.forEach(( type ) => {
					const userStream = vueStore.getters['study/mainStudy/getStream'](type);
					if(userStream && userStream.getAudioTracks().length > 0) {
						this.audioCtx.createMediaStreamSource(userStream).connect(this.audioDest);
					}
				});
				
				
				this.recorder = new MediaRecorder(this.audioDest.stream, LOCAL_RECORDER_OPTION);
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
		this.recorder = null
		this.stream = null
		this.audioCtx = null
		this.audioDest = null
		const duration = Date.now() - this.startTime;
		const blob = new Blob(this.chunks, BLOB_OPTION)
		ysFixWebmDuration(blob, duration, (fixedBlob) => {
			this.downloadFile(URL.createObjectURL(fixedBlob))
			this.chunks = []
			this.isRecording = false
			vueEventBus.$emit('recorder:local:stop')
		});
	},

	updateStream ( stream ) {
		console.log('update stream~~', stream)
		if(this.audioCtx && this.audioDest && stream.getAudioTracks().length > 0) {
			this.audioCtx.createMediaStreamSource(stream).connect(this.audioDest);
		}
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

// function mixStream(stream) {
// 	const audioStream1 = new MediaStream()
// 	const audioTracks = vueStore.getters['study/mainStudy/getStream'](vueStore.state.userInfo.type).getAudioTracks()
// 	audioTracks.forEach((track) => {
// 		audioStream1.addTrack(track)
// 	})
// 	const audioStream2 = new MediaStream()
// 	stream.getAudioTracks().forEach((track) => {
// 		audioStream2.addTrack(track)
// 	})
// 	const mixAudioStream = new MultiStreamsMixer([audioStream1, audioStream2]).getMixedStream()
// 	const newStream = new MediaStream()
// 	stream.getVideoTracks().forEach((track) => {
// 		newStream.addTrack(track)
// 	})
// 	mixAudioStream.getAudioTracks().forEach((track) => {
// 		newStream.addTrack(track)
// 	})
// 	return newStream
// }


function createSilentAudio(time, freq = 44100) {
	const audioFile = new AudioContext().createBuffer(1, time * freq, freq);
	let numOfChan = audioFile.numberOfChannels,
		 len = time * freq * numOfChan * 2 + 44,
		 buffer = new ArrayBuffer(len),
		 view = new DataView(buffer),
		 channels = [], i, sample,
		 offset = 0,
		 pos = 0;

	setUint32(0x46464952);
	setUint32(len - 8);
	setUint32(0x45564157);

	setUint32(0x20746d66);
	setUint32(16);
	setUint16(1);
	setUint16(numOfChan);
	setUint32(audioFile.sampleRate);
	setUint32(audioFile.sampleRate * 2 * numOfChan);
	setUint16(numOfChan * 2);
	setUint16(16);

	setUint32(0x61746164);
	setUint32(len - pos - 4);

	for (i = 0; i < audioFile.numberOfChannels; i++) {
		 channels.push(audioFile.getChannelData(i));
	}

	while (pos < len) {
		for (i = 0; i < numOfChan; i++) {
			sample = Math.max(-1, Math.min(1, channels[i][offset]));
			sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
			view.setInt16(pos, sample, true);
			pos += 2;
		}
		offset++;
	}
	return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));

	function setUint16(data) {
		view.setUint16(pos, data, true);
		pos += 2;
	}

	function setUint32(data) {
		view.setUint32(pos, data, true);
		pos += 4;
	}
}

export default {
	init(eventBus, store, server) {
		vueEventBus = eventBus
		vueStore = store
		roomId = vueStore.getters['study/mainStudy/getRoomCode']
		if(server){
			recorderServer = server
		} else {
			recorderServer = RecorderConfig.server
		}
	},

	updateStream( stream ) {
		if (ServerRecorder.isRecording) {
			ServerRecorder.updateStream(stream)
		}
		if (LocalRecorder.isRecording) {
			LocalRecorder.updateStream(stream)
		}
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
		recorderServer = null
	}
}