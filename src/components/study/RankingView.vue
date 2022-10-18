<template>
	<transition name="transition-up">
		<div id="ranking-view" v-if="isShow">

			<div class="chart-con">
				<div v-for="(list, index) in classMembers" 
					:class="['bar', ranks[index] === 1 ? 'crown' : '']" 
					:key="list.lk_name_en + index">
					<span class="num">0</span>
				</div>
			</div>

			<div class="info-con">
				<div v-for="(list, index) in classMembers" 
					class="info" 
					:key="list.lk_name_en + index">
					<div :class="['rank', 'rank-' + ranks[index]]">{{ranks[index]}}</div>
					<div class="name">{{list.lk_name_en}}</div>
				</div>
			</div>
			
			<ui-button 
				v-if="userInfo.type === currentOwner"
				@button:click="onClickClose" 
				class="close-btn" 
				title="닫기">
			</ui-button>
		</div>
	</transition>
</template>

<script>
import _ from 'lodash'
import { gsap, Cubic } from 'gsap'

export default {
	name: 'rankingView',
	
	data () {
		return {
			isShow: false,
			ranks: []
		}
	},

	computed: {
		classMembers() {
			const memeber = _.sortBy(this.$store.getters['study/mainStudy/getClassMembers'], 'Mpoint').reverse()
			memeber.forEach(( list1, i ) => {
				this.ranks[i] = 1
				memeber.forEach(( list2 ) => {
					if(list1.Mpoint < list2.Mpoint) {
						this.ranks[i]++
					}
				})
			})
			return memeber
		},
		currentOwner () {
			return this.$store.getters['study/mainStudy/getOwner']
		}
	},

	updated () {
		if(this.isShow) {
			
			const bars = this.$el.querySelectorAll('.chart-con .bar')
			const max = this.classMembers[0].Mpoint
			bars.forEach(( bar , i) => {
				let height = 244 - (244 * Math.max(this.classMembers[i].Mpoint / max ? this.classMembers[i].Mpoint / max : 0, 0.25))
				gsap.to(bar, 1, {
					delay: 0.1 + (0.15 * i), 
					y: height + 50, 
					ease:Cubic.easeInOut
				})
				bar.point = 0
				gsap.to(bar, 1, {
					delay: 0.1 + (0.15 * i), 
					point: this.classMembers[i].Mpoint,
					onUpdate: () => {
						bar.querySelector('.num').textContent = Math.ceil(bar.point)
					}
				})
			})
		}
	},

	methods: {
		show () {
			this.isShow = true
		},

		onClickClose () {
			this.hide()
		},

		hide () {
			this.isShow = false
			this.$emit('close')
		}
	}
}
</script>

<style lang="scss">
#ranking-view{
	position: absolute;
	left: 320px;
  	top: 625px;
	width: 500px;
	height: 420px;
	background-color: rgba(79, 96, 119, 0.8);
	box-sizing: border-box;
	border-radius: 15px;
	padding: 30px;
	z-index: 110;

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

	.chart-con {
		width: 420px;
		height: 295px;
		margin: 0 auto;
		border-bottom: solid 2px #fff;
		overflow: hidden;
		margin-top: 0px;
		@include displayFlex;
		.bar {
			position: relative;
			width: 39px;
			height: 244px;
			background: url('~@/assets/images/study/ranking_bar.png') no-repeat;
			margin: 0 25px;
			transform: translateY(295px)
		}
		.bar.crown:before {
			content:'';
			position: absolute;
			left: -8px;
    		top: -42px;
			display: inline-block;
			width: 51px;
			height: 44px;
			background: url('~@/assets/images/study/ranking_crown.png') no-repeat;
		}
		.num {
			position: absolute;
			left: 32px;
			top: 5px;
			width: 48px;
			height: 28px;
			text-align: center;
			line-height: 27px;
			font-size: 14px;
			font-weight: 600;
			background: url('~@/assets/images/study/ranking_num.png') no-repeat;
		}
	}
	.info-con {
		width: 420px;
		margin: 10px auto 0 auto;
		@include displayFlex(flex-start, center);
		.info {
			width: 92px;
			> div {
				text-align: center;
			}
			.rank {
				font-size: 20px;
				color: #fff;
				font-weight: 600;
				height: 30px;
				&.rank-1 {
					color: #ffee7d;
					font-size: 25px;
					position: relative;
					top: -2px;
				}
				&:after {
					font-weight: 400;
					color: #fff;
					font-size: 16px;
					vertical-align: bottom;
					position: relative;
					top: -3px;
				}
				&.rank-1:after {
					content:'st'
				}
				&.rank-2:after {
					content:'nd'
				}
				&.rank-3:after {
					content:'rd'
				}
				&.rank-4:after {
					content:'th'
				}
			}
		}
		.name {
			font-size: 19px;
			font-weight: 400;
			color: #fff;
			word-break: break-all;
		}
	}

}
</style>