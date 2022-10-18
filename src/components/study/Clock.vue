<template>
	<div id="clock" :class="studyType">

		<div class="dot-con" ref="dotCon">
			<span v-for="(dot, i) in dots" 
				:key="i" 
				:class="['dot', dot.active ? 'active' : '']" 
				:style="{'transform': `rotate(${dot.deg}deg)`}" />
		</div>

		<!-- <div class="circle-con">
			<svg width="242" height="242" viewBox="0 0 242 242" class="circle_progress">
				<circle ref="circle" cx="121" cy="121" r="110" stroke-width="20" fill="none" stroke="#6be6ff" class="bar" stroke-linecap="round"></circle>
			</svg>
		</div> -->

		<div class="time" v-html="timeStr" />
		
	</div>
</template>

<script>

import { gsap, Linear } from 'gsap'

export default {
	name: 'clock',

	props: {
		studyType: { type: String, default: 'pre'},
		minut: { type: String, default: '', },
		second: { type: String, default: '', }
	},

	data () {
		return {
			dots: []
		}
	},

	watch: {
		second ( newVal ) {
			this.animation(newVal)
		}
	},

	computed: {
		timeStr () {
			return `<span>${this.minut}’</span>:${this.second}’’`
		}
	},

	mounted () {
		for( let i=0; i<36; i++) {
			this.dots.push({deg: i*10, active: false})
		}
		// this.$refs.circle.style.strokeDasharray = 2 * Math.PI * 110
		// this.$refs.circle.style.strokeDashoffset = 2 * Math.PI * 110
		this.animation(this.second, 0)
	},

	methods: {
		animation ( sec, speed = 1 ) {
			const s = 60 - Math.floor(sec) 
			const percent = s / 60
			const activeLen = Math.floor(36 * percent)
			this.dots.forEach(( dot, i ) => {
				if( i <= activeLen) {
					dot.active = true
				} else {
					dot.active = false
				}
			})
			// if(percent === 1 || (percent > 0 && percent < 0.02)) {
			// 	gsap.set(this.$refs.circle, {strokeDashoffset:(2 * Math.PI * 110)})
			// } else {
			// 	gsap.to(this.$refs.circle, speed, {strokeDashoffset:(2 * Math.PI * 110) * (1-percent), ease: Linear.easeNone})
			// }
		}
	}
}
</script>

<style lang="scss">
#clock {
	position: relative;
	width: 448px;
	height: 513px;
	background: url('~@/assets/images/study/watch_bg.png') no-repeat;
	.time {
		@include displayFlex;
		position: absolute;
		left: 80px;
		top: 235px;
		width: 300px;
		height: 112px;
		background-color: rgba(0,0,0,0.8);
		border-radius: 24px;
		border: solid 4px #d6d6d6;
		font-size: 80px;
		font-weight: 600;
		font-family: "nqr";
		color: #ccc;
		padding-top: 10px;
		> span {
			font-family: "nqr";
			font-size: 90px;
			font-weight: 600;
			color: #fff;
			vertical-align: middle;
		}
	}
	&.after {
		.time {
			left: 45px;
    		top: 205px;
			width: 360px;
			height: 170px;
			padding-top: 75px;
		}
		.time:before {
			content: '남은 대기시간';
			position: absolute;
			width: 100%;
			left: 0;
			top: 15px;
			font-size: 28px;
			color: #fff;
			font-weight: 500;
			text-align: center;
			padding-bottom: 15px;
			box-sizing: border-box;
			border-bottom: dashed 4px #666;
		}
	}

	.dot-con {
		position: absolute;
		left: 225px;
		top: 290px;
		transform-origin: bottom center;
		.dot {
			position: absolute;
			left: 0;
			top: 0;
			&:after {
				position: absolute;
				left: -6px;
				top: -170px;
				content: '';
				display: inline-block;
				width: 12px;
				height: 48px;
				border-radius: 6px;
				background-color: #eee;
				transition: background-color 0.6s;
			}
			&.active:after {
				background-color: #00bfe6;
			}
		}
	}

	.circle-con {
		position: absolute;
		left: 104px;
		top: 169px;
		> svg {
			transform: scaleX(-1) rotate(-90deg);
		}
	}
}
</style>