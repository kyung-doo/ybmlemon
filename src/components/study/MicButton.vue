<template>
	<ui-button type="div" 
		:class="['mic-btn', muted ? 'active' : '']" 
		:title="muted ? '마이크 켜기' : '마이크 끄기'" 
		:toggle="true"
		:style="{'pointer-events': button ? 'all' : 'none'}"
		@button:click="onClickMic">
		<div class="bar-con">
			<span ref="bar" class="bar"></span>
		</div>
	</ui-button>
</template>

<script>
import { gsap } from 'gsap'

export default {
	name: 'micButton',

	props: {
		button: { type: Boolean, default: true },
		stream: { type: String, default: '' }
	},

	data () {
		return {
			audioContext: null,
			analyser: null,
			frequencyData: null,
			animId: null,
			barHeight: 17,
			eventName: '',
			audioTracks: 0
		}
	},

	computed: {
		muted () {
			if(this.button) {
				return this.$store.getters['study/mainStudy/getMicMuted']
			} else {
				return this.audioTracks === 0 ? true : false
			}
		},

		myStream() {
			return this.$store.getters['study/mainStudy/getStream']( this.stream )
		}
	},

	mounted () {
		if(this.button) {
			this.eventName = 'janus:onlocalstream'
		} else {
			this.eventName = 'janus:onremotestream'
		}
		this.$eventBus.$on(this.eventName, this.onChangeStream)
	},

	beforeDestroy() {
		this.$eventBus.$off(this.eventName, this.onChangeStream)
	},

	methods: {
		onClickMic () {
			this.$forceUpdate()
			this.$store.dispatch('study/mainStudy/setMicMuted', this.$el.classList.contains('active'))
		},

		onChangeStream ( type ) {
			if(this.eventName === 'janus:onlocalstream' || (this.eventName === 'janus:onremotestream' && this.stream === type)) {
				this.audioTracks = this.myStream.getAudioTracks().length
				if(this.myStream.getAudioTracks().length > 0) {
					this.setFrequency()
				} else {
					clearInterval(this.animId)
					this.analyser = null
					this.frequencyData = null
					this.audioContext = null
				}
			}
		},

		setFrequency () {
			gsap.set(this.$refs.bar, {y: this.barHeight})
			if(!this.muted) {
				this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
				this.analyser = this.audioContext.createAnalyser()
				const source = this.audioContext.createMediaStreamSource( this.myStream )
				source.connect( this.analyser )
				this.analyser.smoothingTimeConstant = 0.5;
				this.analyser.minDecibels = -60
				this.analyser.maxDecibels = -40
				this.analyser.fftSize = 32;
				this.frequencyData = new Uint8Array( this.analyser.frequencyBinCount )
				this.animId = setInterval(this.renderFrame, 1000/30)
			} else {
				clearInterval(this.animId)
				this.analyser = null
				this.frequencyData = null
				this.audioContext = null
			}
		},

		renderFrame () {
			if(this.frequencyData) {
				this.analyser.getByteFrequencyData(this.frequencyData)
				let sum = 0
				let length = 0
				for(let i =0; i<16; i++) {
					sum += this.frequencyData[i]
					if(this.frequencyData[i] > 0) length++
				}
				let height = sum / length || 0
				height = (height / 255) * 100
				if(height < 50) height = 0
				height = Math.min(this.barHeight * (height*0.01), this.barHeight)
				gsap.to(this.$refs.bar, 0.6, {y: this.barHeight - height})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.mic-btn {
	position: relative;
	display: inline-block;
	width: 38px;
	height: 36px;
	background: url('~@/assets/images/study/mic_icon.png') no-repeat;
	vertical-align: middle;
	.bar-con {
		position: absolute;
		left: 15px;
		top: 3px;
		width: 10px;
		height: 17px;
		border-radius: 6px;
		overflow: hidden;
	}
	.bar {
		position: absolute;
		left: 0;
		top: 0;
		width: 10px;
		height: 17px;
		background-color: #fff;
		transform: translateY(17px);
	}

	&.active {
		background-position-y: -36px;
		.bar-con {
			display: none;
		}
	}

    
}
</style>