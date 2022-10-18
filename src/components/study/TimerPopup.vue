<template>
	<div id="timer-popup">
		<div class="pop-wrap">

			<!-- pop-header -->
			<div class="pop-header">
				<h4 class="title">학습 타이머</h4>
				<ui-button class="close-btn" @button:click="onCancel"></ui-button>
			</div>
			<!-- //pop-header -->

			<!-- pop-btns -->
			<div class="pop-btns">
				<ui-button @button:click="setSeconds(10)">10</ui-button>
				<ui-button @button:click="setSeconds(30)">30</ui-button>
				<ui-button @button:click="setSeconds(60)">60</ui-button>
			</div>
			<!-- //pop-btns -->

			<!-- pop-times -->
			<div class="pop-times">
				<div class="num minut">{{$addZero(minuts, 2)}}</div>
				<div class="count-con">
					<ui-button class="plus" @button:down="onTouchstart(incMinuts)" @button:click="incMinuts(true)"></ui-button>
					<span class="txt">분</span>
					<ui-button class="minus" @button:down="onTouchstart(decMinuts)" @button:click="decMinuts(true)"></ui-button>
				</div>
				<div class="num second">{{$addZero(seconds, 2)}}</div>
				<div class="count-con">
					<ui-button class="plus" @button:down="onTouchstart(incSeconds)" @button:click="incSeconds(true)"></ui-button>
					<span class="txt">초</span>
					<ui-button class="minus" @button:down="onTouchstart(decSeconds)" @button:click="decSeconds(true)"></ui-button>
				</div>
			</div>
			<!-- //pop-times -->
			
			<!-- pop-bottom -->
			<div class="pop-bottom">
				<ui-button class="reset-btn" @button:click="onReset">Reset</ui-button>
				<ui-button class="enter-btn" @button:click="onEnter">Start</ui-button>
			</div>
			<!-- //pop-bottom -->
		
		</div>
	</div>
</template>

<script>

export default {
	name: 'timerPopup',

	
	data () {
		return {
			minuts: 0,
			seconds: 0,
			timer: null,
			delay: null
		}
	},

	methods: {
		
		setSeconds ( sec ) {
			this.seconds += sec;
			if(this.seconds > 60) {
				this.seconds -= 60;
				this.minuts++;
			}
		},

		onTouchstart( callFunc ) {
			clearTimeout(this.delay)
			this.delay = setTimeout(() => {
				this.timer = setInterval(()=> {
					callFunc( false )
				}, 100)
			}, 600)
		},

		incSeconds ( cleartimer ) {
			if(cleartimer){
				clearInterval(this.timer)
				clearTimeout(this.delay)
			}
			if(this.seconds < 60) {
				this.seconds++
			}
		},

		decSeconds ( cleartimer ) {
			if(cleartimer){
				clearInterval(this.timer)
				clearTimeout(this.delay)
			}
			if(this.seconds > 0) {
				this.seconds--
			}
		},

		incMinuts ( cleartimer) {
			if(cleartimer){
				clearInterval(this.timer)
				clearTimeout(this.delay)
			}
			if(this.minuts < 60) {
				this.minuts++
			}
		},

		decMinuts ( cleartimer ) {
			if(cleartimer){
				clearInterval(this.timer)
				clearTimeout(this.delay)
			}
			if(this.minuts > 0) {
				this.minuts--
			}
		},

		onReset() {
			this.minuts = 0
			this.seconds = 0
		},

		onCancel () {
			this.$emit('submit', { type: 'cancel'})
		},

		onEnter () {
			this.$emit('submit', { type: 'enter', time: parseInt(this.minuts) * 60 + parseInt(this.seconds)})
		}
	}
}
</script>

<style lang="scss">
#timer-popup{
	position: absolute;
	left:0;
	top: 0;
	z-index: 999;
	@include displayFlex;
	@include fullSize;
	
	.pop-wrap {
		position: relative;
		width: 500px;
		height: 420px;
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
				width: 22px;
				height: 24px;
				background: url('~@/assets/images/study/timer_tit_icon.png') no-repeat;
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

	.pop-btns {
		@include displayFlex;
		height: 101px;
		border-bottom: solid 1px #b9bfc9;
		.btn {
			width: 114px;
			height: 59px;
			background: url('~@/assets/images/study/timer_pop_btn_bg.png') no-repeat;
			margin: 0 8px;
			font-size: 33px;
			font-weight: 600;
			box-sizing: border-box;
			padding-top: 5px;
			&:hover,
			&.down {
				background-position-y: -59px;
			}
			&:before {
				content:'+';
				margin-right: 5px;
				color: #989494;
			}
			&:hover:before,
			&.down:before {
				color: #fab8b8;
			}
		}
	}

	.pop-times {
		@include displayFlex;
		height: 144px;
		.num {
			@include displayFlex;
			padding-top: 8px;
			width: 92px;
			height: 103px;
			font-size: 50px;
			font-weight: 600;
			background: url('~@/assets/images/study/timer_num_bg.png') no-repeat;
		}
		.count-con {
			margin: 0 15px;
			text-align: center;
			.btn {
				display: block;
				width: 29px;
				height: 25px;
				&.plus {
					background: url('~@/assets/images/study/timer_up_btn.png') no-repeat;
				}
				&.minus {
					background: url('~@/assets/images/study/timer_down_btn.png') no-repeat;
				}
				&:hover,
				&.down {
					background-position-y: -25px;
				}
			}
			.txt {
				display: block;
				margin: 6px 0;
				font-size: 28px;
				font-weight: 600;
			}
		}
	}

	.pop-bottom {
		margin-top: 15px;
		text-align: center;
		.btn {
			width: 185px;
			height: 72px;
			margin: 0 2px;
			font-size: 30px;
			font-weight: 600;
			color: #2a3c42;
			&.reset-btn {
				background: url('~@/assets/images/study/timer_reset_btn.png') no-repeat;
			}
			&.enter-btn {
				background: url('~@/assets/images/study/timer_enter_btn.png') no-repeat;
				color: #fff;
			}
			&:hover,
			&.click {
				background-position-y: -72px;
			}
			&:hover.enter-btn,
			&.click.enter-btn {
				color: #2a3c42;
			}
		}
	}

}
</style>