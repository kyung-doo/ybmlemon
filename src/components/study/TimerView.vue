<template>
	<div id="timer-view" v-show="isShow">

		<ui-sequence
			ref="normalSeq" 
			source="timer_clock_normal"
			name="timer_"
			:total-frames="180"
			:fps="30"
			:loop="true"
			v-show="showType === 'normal'">
		</ui-sequence>

		<ui-sequence
			ref="fastSeq"
			source="timer_clock_fast"
			name="timer_"
			:total-frames="30"
			:fps="30"
			:loop="true"
			v-show="showType === 'fast'">
		</ui-sequence>

		<div class="count-box">{{countVal}}</div>

		<button v-if="userInfo.type === currentOwner" class="cancel-btn" @click="onCancel"  />

	</div>
</template>

<script>

import AudioControl from '@/libs/audioControl'
import { Draggable } from "gsap/Draggable"

export default {
	name: 'timerView',
	
	data () {
		return {
			isShow: false,
			count: 0,
			showType: '',
			endTime: null
			// normalAudio: null,
			// fastAudio: null
		}
	},

	computed: {
		currentOwner () {
			return this.$store.getters['study/mainStudy/getOwner']
		},
		
		countVal () {
			if(this.count > 60) {
				return `${this.$addZero(Math.floor(this.count/60), 2)}:${this.$addZero(this.count % 60, 2)}`
			} 
			return `00:${this.$addZero(this.count, 2)}`
		}
	},

	mounted () {
		const studyContent = document.querySelector('#studyContent')
		Draggable.create(this.$el, {
			type: 'x,y',
			bounds: '.viewer-container',
			onDragStart: () => {
				studyContent.style['pointer-events'] = 'none'
			},
			onDragEnd: ({x, y}) => {
				this.dragPoition = {x: x, y: y}
				studyContent.style['pointer-events'] = ''
			}
		})
	},

	beforeDestroy() {
		this.$eventBus.$off('timeupdate', this.onTimeupdate)
	},

	methods: {
		start ( time ) {
			this.stop()
			if(time === 0) return
			this.isShow = true
			this.count = time
			this.endTime = this.$eventBus.now.getTime() + (this.count * 1000)

			this.showType = 'normal'
			this.$refs.normalSeq.play()
			this.$refs.fastSeq.stop()
			
			// this.normalAudio = new AudioControl('tictok.mp3', {loop: true})
			// this.fastAudio = new AudioControl('tictok_fast.mp3', {loop: true})
			// this.normalAudio.play()

			this.$eventBus
				.$off('timeupdate', this.onTimeupdate)
				.$on('timeupdate', this.onTimeupdate)
		},

		stop () {
			this.$eventBus.$off('timeupdate', this.onTimeupdate)
			this.isShow = false
			this.showType = ''
			this.$refs.normalSeq.stop()
			this.$refs.fastSeq.stop()
			// if(this.normalAudio) {
			// 	this.normalAudio.destroy()
			// }
			// if(this.fastAudio) {
			// 	this.fastAudio.destroy()
			// }
			// this.normalAudio= null
			// this.fastAudio = null
		},

		onTimeupdate ( now ) {
			
			this.count = Math.floor((this.endTime - now.getTime())/1000)
			console.log('TIMER :: ', this.count)
			if(this.count === 0) {
				this.stop()
			} else if(this.count <= 6) {
				if(this.showType !== 'fast') {
					// this.normalAudio.stop();
					// this.fastAudio.play();
					this.showType = 'fast'
					this.$refs.normalSeq.stop()
					this.$refs.fastSeq.play()
				}
			} 
		},

		onCancel () {
			this.$emit('cancel')
		}
	}
}
</script>

<style lang="scss">
#timer-view{
	position: absolute;
	left: 990px;
	top: 30px;
	width: 177px;
	height: 181px;

	.count-box{
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 50px;
		color: #fff;
		font-size: 24px;
		font-weight: 500;
		text-align: center;
		line-height: 50px;
		border-top-left-radius: 15px;
		border-top-right-radius: 15px;
		background-color: #caabb3;
	}

	.cancel-btn {
		position: absolute;
		right: 8px;
		top: 8px;
		width: 34px;
		height: 34px;
		background: url('~@/assets/images/study/pop_close.png') no-repeat;
		background-position-y: -34px;
		&:hover {
			background-position-y: 0;
		}
	}
}
</style>