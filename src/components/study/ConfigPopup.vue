<template>
	<div id="config-popup">
		<div class="pop-wrap">

			<!-- pop-header -->
			<div class="pop-header">
				<h4 class="title">설정</h4>
				<ui-button class="close-btn" @button:click="onCancel"></ui-button>
			</div>
			<!-- //pop-header -->

			<!-- pop-tab -->
			<div class="pop-tab">
				<ui-tab-menu
					class="main-tab"
					:active-index="1" 
					@tabmenu:change="onChangeTab">
					<ui-button><span>비디오</span></ui-button>
					<ui-button><span>장치정보</span></ui-button>
				</ui-tab-menu>
			</div>
			<!-- //pop-tab -->

			<div class="pop-content">
				<div v-show="menuIndex === 1" class="tab-content content1">
					<ui-tab-menu 
						:active-index="qulityIndex" 
						@tabmenu:change="onChangeQulity">
						<ui-button>저화질</ui-button>
						<ui-button>표준화질</ui-button>
						<ui-button>고화질</ui-button>
					</ui-tab-menu>
				</div>

				<div v-show="menuIndex === 2" class="tab-content content2">
					<div class="select-con">
						<p>카메라 입력</p>
						<select v-model="selectedVideoInput">
							<option v-for="list in videoInputList" :key="list.deviceId" :value="list.deviceId">
								{{ list.label }}
							</option>
						</select>
						<p>오디오 입력</p>
						<select v-model="selectedAudioInput">
							<option v-for="list in audioInputList" :key="list.deviceId" :value="list.deviceId">
								{{ list.label }}
							</option>
						</select>
						<p>오디오 출력</p>
						<select v-model="selectedAudioOutput">
							<option v-for="list in audioOutputList" :key="list.deviceId" :value="list.deviceId">
								{{ list.label }}
							</option>
						</select>
					</div>
					<div class="video-con">
						<video ref="testVideo" autoplay playsinline></video>
					</div>
					<div class="mic-gage">
						<div ref="micBar" class="bar"></div>
					</div>
					<ui-button class="test-audio" @button:click="testAudio.stop().play()">테스트 오디오</ui-button>
				</div>
			</div>

			<div class="pop-bottom">
				<ui-button class="save-btn" @button:click="onEnter">저장</ui-button>
				<ui-button class="cancel-btn" @button:click="onCancel">취소</ui-button>
			</div>
			
		</div>
	</div>
</template>

<script>
import { gsap } from 'gsap'
import AudioControl from '@/libs/audioControl'
import { isIOS } from 'mobile-device-detect';

export default {
	name: 'configPopup',

	props: {
		deviceLists: null
	},

	data () {
		return {
			qulityTyps: ['low', 'medium', 'high'],
			menuIndex: 1,

			qulityIdx: 0,

			videoInputList:[],
			audioInputList:[],
			audioOutputList:[],

			selectedVideoInput: '',
			selectedAudioInput: '',
			selectedAudioOutput: '',

			stream: null,
			audioContext: null,
			analyser: null,
			frequencyData: null,
			animId: null,
			testAudio: new AudioControl('test_sound.mp3')
		}
	},

	computed: {
		qulityIndex: {
			set: function ( newVal ) {
				this.qulityIdx = newVal
			},
			get: function () {
				this.qulityIdx = this.qulityIdx === 0 ? this.qulityTyps.indexOf( this.qulity ) + 1 : this.qulityIdx
				return this.qulityIdx
			}
		},

		qulity () {
			return this.$store.getters['study/mainStudy/getConfigs'].qulity
		},
		videoInput() { 
			return this.$store.getters['study/mainStudy/getConfigs'].videoInput
		},
		audioInput() {
			return this.$store.getters['study/mainStudy/getConfigs'].audioInput
		},
		audioOutput() { 
			return this.$store.getters['study/mainStudy/getConfigs'].audioOutput
		}
	},

	watch: {
		menuIndex ( newVal ) {
			if(newVal === 2) {
				this.startStream()
			} else {
				this.stopTracks()
			}
		},

		selectedVideoInput () {
			this.stopTracks()
			if(this.menuIndex === 2) {
				this.startStream()
			}
		},

		selectedAudioInput () {
			this.stopTracks()
			if(this.menuIndex === 2) {
				this.startStream()
			}
		},

		selectedAudioOutput () {
			if( this.stream ) {
				this.$refs.testVideo.setSinkId( this.selectedAudioOutput )
			}
		}
	},

	mounted() {
		this.initDevice(this.deviceLists, true)
	},

	beforeDestroy() {
		this.stopTracks()
		this.testAudio.destroy()
	},

	methods: {
		onChangeTab ( idx ) {
			this.menuIndex = idx
		},

		onChangeQulity ( idx ) {
			this.qulityIndex = idx
		},

		initDevice( devices, isFirst = false ) {
			this.stopTracks()
			this.videoInputList = []
			this.audioInputList = []
			this.audioOutputList = []

			devices.forEach( list => {
				if(list.kind === 'videoinput') {
					this.videoInputList.push( list )
				} else if(list.kind === 'audioinput') {
					this.audioInputList.push( list )
				} else {
					this.audioOutputList.push( list )
				}
			})

			if(this.videoInputList.length == 0) {
				this.videoInputList.push({deviceId: '', label: '카메라 입력 장치가 없습니다.'})
			}
			if(this.audioInputList.length == 0) {
				this.audioInputList.push({deviceId: '', label: '오디오 입력 장치가 없습니다.'})
			}
			if(this.audioOutputList.length == 0) {
				this.audioOutputList.push({deviceId: '', label: '오디오 출력 장치가 없습니다.'})
			}
			this.selectedVideoInput = this.videoInput === '' ? this.videoInputList[0].deviceId : this.videoInput
			this.selectedAudioInput = this.audioInput === '' ? this.audioInputList[0].deviceId : this.audioInput
			this.selectedAudioOutput = this.audioOutput === '' ? this.audioOutputList[0].deviceId : this.audioOutput
		},

		changeDevice ( devices ) {
			this.initDevice(devices)
			if(this.menuIndex === 2 && this.videoInputList.length > 0) {
				this.startStream()
			}
		},

		onEnter () {
			this.$emit('submit', {
				type: 'enter',
				data: {
					qulity: this.qulityTyps [this.qulityIndex-1],
					videoInput: this.selectedVideoInput,
					audioInput: this.selectedAudioInput,
					audioOutput: this.selectedAudioOutput
				}
			})
		},

		onCancel () {
			this.$emit('submit', { type: 'cancel'})
		},

		stopTracks () {
			if(this.stream) {
				var tracks = this.stream.getTracks();
				for(var track of tracks) {
					if(track) {
						track.stop();
					}
				}
				this.stream = null
				this.$refs.testVideo.srcObject = null
			}
			clearInterval(this.animId)
			this.analyser = null
			this.frequencyData = null
			this.audioContext = null
		},

		async startStream () {
			this.stream = null
			
			if(isIOS) {
				this.$store.dispatch('study/mainStudy/removeStream', this.userInfo.type)
			}

			try{
				this.stream = await navigator.mediaDevices.getUserMedia({
					audio: { 
						deviceId: { exact: this.selectedAudioInput } 
					},
					video: {
						width: { exact: 320, ideal: 320 },
						width: { exact: 240, ideal: 240 },
						deviceId: { exact: this.selectedVideoInput }
					}
				})
				
				this.$refs.testVideo.srcObject = this.stream
				this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
				this.analyser = this.audioContext.createAnalyser()
				const source = this.audioContext.createMediaStreamSource( this.stream )
				source.connect( this.analyser )
				this.analyser.smoothingTimeConstant = 0.5;
				this.analyser.minDecibels = -60
				this.analyser.maxDecibels = -40
				this.analyser.fftSize = 32;
				this.frequencyData = new Uint8Array( this.analyser.frequencyBinCount )
				this.animId = setInterval(this.renderFrame, 1000/30)
			} catch( error ) {
				console.error( error )
			}
			
		},

		renderFrame () {
			if(!this.frequencyData) return
			this.analyser.getByteFrequencyData(this.frequencyData)
			let sum = 0
			let length = 0
			for(let i =0; i<16; i++) {
				sum += this.frequencyData[i]
				if(this.frequencyData[i] > 0) length++
			}
			let width = sum / length || 0
			width = (width / 255) * 100
			if(width < 30) width = 0
			gsap.to(this.$refs.micBar, 0.6, {width: Math.min(width, 100) + '%'})
		}
	}
}
</script>

<style lang="scss">
#config-popup{
	position: absolute;
	left:0;
	top: 0;
	z-index: 999;
	@include displayFlex;
	@include fullSize;

	.pop-wrap {
		position: relative;
		width: 800px;
		height: 520px;
		background-color: #a7afbb;
		border-radius: 12px;
		overflow: hidden;
	}

	.pop-header {
		height: 61px;
		box-sizing: border-box;
		background-color: #4f6077;
		.title {
			padding: 18px 28px;
			font-weight: 500;
			font-size: 24px;
			color: #fff;
			&:before {
				content:'';
				display: inline-block;
				vertical-align: middle;
				width: 24px;
				height: 24px;
				background: url('~@/assets/images/study/config_tit_icon.png') no-repeat;
				margin-right: 8px;
			}
		}
		.close-btn {
			position: absolute;
			width: 34px;
			height: 34px;
			right: 10px;
			top: 10px;
			background: url('~@/assets/images/study/pop_close.png') no-repeat;
			background-position-y: -34px;
			&:hover,
			&.down {
				background-position-y: 0;
			}
		}
	}

	.pop-tab {
		padding: 10px 35px;
		border-bottom: solid 2px #b6bcc6;
		.btn {
			position: relative;
			display: inline-block;
			width: 144px;
			height: 49px;
			> span {
				position: relative;
				font-size: 27px;
				font-weight: 600;
				color: #d6d9df;
			}
			&:before {
				position: absolute;
				left:0;
				top: 0;
				content:'';
				width: 144px;
				height: 49px;
				display:inline-block;
				background: url('~@/assets/images/study/config_tab.png') no-repeat;
				opacity: 0;
			}
			&.active {
				&:before {
					opacity: 1;
				}
				> span {
					color: #000;
				}
			}
		}
	}

	.pop-content{
		height: 278px;
		.content1 {
			@include displayFlex;
			height: 100%;
			.btn {
				position: relative;
				width: 218px;
				font-size: 32px;
				font-weight: 600;
				padding-left: 62px;
				color: #000;
				opacity: 0.5;
				text-align: left;
				&:hover {
					opacity: 1;
					color: #aff7fa;
				}
				&.active {
					opacity: 1 !important;
					color: #000 !important;
				}
				&:before {
					content: '';
					position: absolute;
					left: 0;
					top: -8px;
					width: 46px;
					height: 46px;
					background: url('~@/assets/images/study/check_big.png') no-repeat;
				}
				&.active:before {
					background-position-y: -46px;
				}
			}
		}
		.content2 {
			position: relative;
			box-sizing: border-box;
			padding: 0 30px;
			.select-con {
				p {
					font-size: 20px;
					font-weight: 500;
					margin: 10px 0;
				}
				select {
					width: 433px;
					height: 46px;
					font-size: 20px;
					font-weight: 500;
					background: #8c99a1;
					padding: 10px;
					text-overflow:ellipsis;
				}
			}
			.video-con {
				position: absolute;
				top: 0;
				left: 488px;
				width: 280px;
				height: 210px;
				border-radius: 10px;
				overflow: hidden;
				background-color: #2a3c42;
				> video {
					object-fit: cover;
					width: 100%;
					height: 100%;
				}
			}
			.mic-gage {
				position: absolute;
				top: 220px;
				left: 488px;
				width: 280px;
				height: 9px;
				border-radius: 5px;
				background-color: #2a3c42;
				.bar {
					height: 100%;
					border-radius: 5px;
					background-color: #fbf54b;
				}
			}
			.test-audio {
				position: absolute;
				top: 235px;
				left: 488px;
				font-size: 20px;
				font-weight: 500;
			}
		}
	}

	.pop-bottom {
		position: absolute;
		bottom: 30px;
		left: 0;
		width: 100%;
		text-align: center;
		.btn {
			width: 185px;
			height: 72px;
			margin: 0 3px;
			color: #fff;
			font-size: 30px;
			font-weight: 600;
			&.save-btn {
				background: url('~@/assets/images/study/config_save_btn.png') no-repeat;
			}
			&.cancel-btn {
				background: url('~@/assets/images/study/config_cancel_btn.png') no-repeat;
			}
			&:hover,
			&.down {
				background-position-y: -72px;
			}
		}
	}
}
</style>