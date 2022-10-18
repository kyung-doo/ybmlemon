<template>
	<div id="hand-game-view" v-show="isShow">

		<transition name="zoom">
			<div v-show="result" :class="['result', result.toLowerCase()]">
				{{ result }}
			</div>
		</transition>

		<ui-sequence
			v-show="result === 'Lose'"
			class="sequence lose"
			ref="loseAni" 
			source="hand_game_lose"
			name="lose_"
			:total-frames="42"
			:fps="30"
			:loop="false">
		</ui-sequence>

		<ui-sequence
			v-show="result === 'Win'"
			class="sequence win"
			ref="winAni" 
			source="hand_game_win"
			name="win_"
			:total-frames="42"
			:fps="30"
			:loop="false">
		</ui-sequence>

		<ui-sequence
			v-show="result === 'Draw'"
			class="sequence draw"
			ref="drawAni" 
			source="hand_game_draw"
			name="draw_"
			:total-frames="42"
			:fps="30"
			:loop="false">
		</ui-sequence>

		<div ref="hand1" :class="['hand', 'hand1']"></div>
		<div ref="hand2" :class="['hand', 'hand2']"></div>
		
	</div>
</template>

<script>

import { gsap, Cubic } from 'gsap'
import AudioControl from '@/libs/audioControl'

export default {
	name: 'handGameView',
	
	data () {
		return {
			isShow: false,
			handIdx1: 0,
			handIdx2: 0,
			audio: null,
			timer: null,
			closeDelay: 3000,
			result: '',
		}
	},

	methods: {

		start (hand1, hand2) {
			this.isShow = true
			this.handIdx1 = hand1
			this.handIdx2 = hand2
			this.result = ''

			this.$refs.hand1.classList.remove('hand-type1')
			this.$refs.hand1.classList.remove('hand-type2')
			this.$refs.hand1.classList.remove('hand-type3')

			this.$refs.hand2.classList.remove('hand-type1')
			this.$refs.hand2.classList.remove('hand-type2')
			this.$refs.hand2.classList.remove('hand-type3')

			gsap.set(this.$refs.hand1, {opacity: 0, x: -150, rotation: -45})
			gsap.set(this.$refs.hand2, {opacity: 0, x: 150, rotation: 45})

			gsap.to(this.$refs.hand1, 0.6, {delay: 0.1, opacity: 1, x: 0, rotation:0, ease: Cubic.easeOut})
			gsap.to(this.$refs.hand2, 0.6, {delay: 0.1, opacity: 1, x: 0, rotation:0, ease: Cubic.easeOut})
		
			setTimeout(() => {
				this.$refs.hand1.classList.add(`hand-type${this.handIdx1}`)
				this.$refs.hand2.classList.add(`hand-type${this.handIdx2}`)
			}, 600)

			setTimeout(() => {
				this.result = this.calcResult()
				this.$refs[`${this.result.toLowerCase()}Ani`].gotoAndPlay(1)
			}, 1000)

			this.audio = new AudioControl('hand_drop.mp3')
			this.audio.play()

			clearTimeout(this.timer)
			this.timer = setTimeout(() => {
				this.stop()
			}, this.closeDelay)
			this.$emit('start')
		},

		calcResult () {
			if(this.handIdx1 === this.handIdx2) {
				return 'Draw'
			} else {
				if(this.handIdx1 === 1) {
					if(this.handIdx2 === 2) {
						return 'Win'
					} else {
						return 'Lose'
					}
				} else if(this.handIdx1 === 2) {
					if(this.handIdx2 === 3) {
						return 'Win'
					} else {
						return 'Lose'
					}
				} else {
					if(this.handIdx2 === 1) {
						return 'Win'
					} else {
						return 'Lose'
					}
				}
			}
		},

		stop () {
			this.isShow = false
			this.handIdx1 = 0
			this.handIdx2 = 0
			this.result = ''
			if(this.audio) {
				this.audio.destroy()
			}
			this.audio = null
			clearTimeout(this.timer)
			this.$emit('finish')
		}
	}
}
</script>

<style lang="scss">
#hand-game-view{
	position: absolute;
	left:0;
	top: 0;
	@include fullSize();
	
	.hand {
		position: absolute;
		left:0;
		top: 450px;
		width: 220px;
		height: 199px;
		&:before {
			content:'';
			display: block;
			width: 100%;
			height: 100%;
			background: url('~@/assets/images/study/hand.png') no-repeat;
		}
		&.hand1 {
			left: 770px;
			transform-origin: left bottom;
		}
		&.hand2 {
			left: 1230px;
			transform-origin: right bottom;
		}
		&.hand2:before {
			transform: scaleX(-1);
		}
		&.hand-type1:before {
			background-position-y: -199px;
		}
		&.hand-type2:before {
			background-position-y: 0;
		}
		&.hand-type3:before {
			background-position-y: -398px;
		}
	}

	.result {
		position: absolute;
		left: 995px;
    	top: 483px;
		width: 232px;
		height: 152px;
		border-radius: 70px;
		background-color: #66E0F9;
		font-weight: 600;
		font-size: 70px;
		text-align: center;
		line-height: 150px;
		&.win {
			background-color: #66E0F9;
		}
		&.draw {
			background-color: #BBBDC2;
		}
		&.lose {
			background-color: #F1B1D4;
		}
	}
	.sequence {
		position: absolute;
		left: 760px;
    	top: 365px;
		width: 700px;
		height: 400px;
	}
}
</style>