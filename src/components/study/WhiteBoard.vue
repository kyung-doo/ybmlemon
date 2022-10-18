<template>
	<div id="white-board" 
		:class="[(userInfo.type === currentOwner && whiteBoardData.status === 'open') || (userInfo.type === 'ST' && STPermissions.board) ? 'open' : '', whiteBoardData.whiteMode ? 'white' : '']">

		<!-- board -->
		<div ref="board" :class="['board', writer ? 'writer': 'listener']">
			<canvas ref="boardCanvas" id="board-canvas"></canvas>
		</div>
		<!-- //board -->

		<!-- toolbar -->
		<transition name="toolbar">
			<div ref="toolBar" 
				:class="['toolbar', userInfo.type === 'ST' ? 'st': '']" 
				v-show="(userInfo.type === currentOwner && whiteBoardData.status === 'open') || (userInfo.type === 'ST' && STPermissions.board)">
				<div class="toolbar-wrap">
					
					<ui-button @button:click="onClickWhite" 
						v-show="userInfo.type === currentOwner"
						:toggle="true" 
						:class="['white-btn', whiteBoardData.whiteMode ? 'active': '']" 
						title="화이트보드">
					</ui-button>

					<ui-tab-menu ref="tabMenu" 
						:active-index="1" 
						@tabmenu:change="onChangeTab">
						<ui-button v-for="(list, index) in tabList" 
							:key="index" 
							:title="list.title"
							:class="`${list.tool}-btn`">
						</ui-button>
					</ui-tab-menu>

					<ui-button @button:click="onClickTrash" 
						class="trash-btn" 
						title="삭제">
					</ui-button>

					<ui-button @button:click="onClickUndo" 
						class="undo-btn" 
						title="뒤로">
					</ui-button>

					<ui-button @button:click="onClickRedo" 
						class="redo-btn" 
						title="앞으로">
					</ui-button>

					<ui-button @button:click="onClickColor('fill')" 
						:class="['fill-color', fillPickShow ? 'active':'']" 
						:style="'background-color: '+ fillColor">
					</ui-button>

					<ui-button @button:click="onClickColor('line')"
						:class="['line-color', linePickShow ? 'active':'']" 
						:style="'background-color: '+ lineColor">
					</ui-button>

					<ui-button @button:click="onClickLineWidth"
						:class="['line-width-btn']">
						<img src="~@/assets/images/study/stroke_icon.png" />
					</ui-button>

					<ui-button @button:click="onClickOpacity"
						:class="['opacity-btn']">
						{{opacity}}%
					</ui-button>
					
				</div>
			</div>
		</transition>
		<!-- //toolbar -->

		<!-- line-width-pick -->
		<div :class="['line-width-pick', userInfo.type === 'ST' ? 'st': '']" 
			:style="{'visibility': lineWidthPickShow ? 'visible' : 'hidden'}">
			<ui-tab-menu class="stroke-tab"
				ref="lineWidthTabMenu" 
				:active-index="1" 
				@tabmenu:change="onChangeLineWidthTab">
				<ui-button class="stoke-1" :style="'background-color: '+ lineColor"></ui-button>
				<ui-button class="stoke-2" :style="'background-color: '+ lineColor"></ui-button>
				<ui-button class="stoke-3" :style="'background-color: '+ lineColor"></ui-button>
				<ui-button class="stoke-4" :style="'background-color: '+ lineColor"></ui-button>
				<ui-button class="stoke-5" :style="'background-color: '+ lineColor"></ui-button>
			</ui-tab-menu>
		</div>
		<!-- //line-width-pick -->
		
		<!-- opacity-pick -->
		<div :class="['opacity-pick', userInfo.type === 'ST' ? 'st': '']"
			:style="{'visibility': opacityPickShow ? 'visible' : 'hidden'}">
			<div class="txt">{{opacity}}%</div>
			<vue-range-slider 
				class="opacity-slider" 
				ref="opacitySlider" 
				:tooltip="false"
				v-model="opacity" 
				:width="97"
				:height="9"
				:dot-width="14"
				:dot-height="28"
				:speed="0"
				@drag-start="() => clearTimeout(timer)"
				@drag-end="onOpacity" />
		</div>
		<!-- //opacity-pick -->

		<!-- color-picker -->
		<transition name="color-picker">
			<compact class="fill-color" ref="fillColor" v-show="fillPickShow" v-model="pickerColor.fill"></compact>
		</transition>
		<transition name="color-picker">
			<compact class="line-color" ref="lineColor" v-show="linePickShow" v-model="pickerColor.line"></compact>
		</transition>
		<!-- //color-picker -->

	</div>
</template>

<script>
import { gsap, Cubic } from 'gsap'
import { Compact } from 'vue-color'
import WhiteBoardService from '@/libs/whiteBoardService'

export default {
	name: 'whiteBoard',

	components: {
		Compact
	},

	data () {
		return {
			tabList: [
				{ active: true, title:'선택', tool:'select' },
				{ title:'펜', tool:'pen' },
				{ title:'라인', tool:'line' },
				{ title:'텍스트', tool:'text' },
				{ title:'사각형', tool:'rect' },
				{ title:'삼각형', tool:'triangle' },
				{ title:'원', tool:'ellipse' }
			],

			lineWidthList: [2, 4, 6, 8, 10],

			fillPickShow: false,
			linePickShow: false,
			lineWidthPickShow: false,
			opacityPickShow: false,

			pickerColor: {
				fill: { type: Object },
				line: { type: Object }
			},

			lineWidth: 2,

			opacity: 100,

			timer: null
			
		}
	},

	computed: {
		currentOwner () {
			return this.$store.getters['study/mainStudy/getOwner']
		},

		STPermissions () {
			return this.$store.getters['study/mainStudy/getSTPermissions']
		},

		writer () {
			if(this.userInfo.type === this.currentOwner) return true
			if(this.userInfo.type === 'ST' && this.STPermissions.board) return true
			return false
		},

		whiteBoardData() {
			return this.$store.getters['study/mainStudy/getWhiteBoard']
		},

		fillColor: {
			get: function () {
				return this.whiteBoardData.fillColor
			},
			set: function ( newValue ) {
				this.$store.dispatch('study/mainStudy/setWhiteBoard', { fillColor: newValue })
			}
		},
		lineColor : {
			get: function () {
				return this.whiteBoardData.lineColor
			},
			set: function ( newValue ) {
				this.$store.dispatch('study/mainStudy/setWhiteBoard', { lineColor: newValue })
			}
		},

		studyPages () {
			return this.$store.getters['study/mainStudy/getStudyPages']
		}

	},

	watch: {

		lineWidth () {
			WhiteBoardService.changeLineWidth( this.lineWidth )
		},

		opacity () {
			WhiteBoardService.changeOpacity( this.opacity )
		},

		'pickerColor.fill' () {
			if(typeof this.pickerColor.fill === 'object') {
				this.fillColor = this.pickerColor.fill.hex
				WhiteBoardService.changeColor({fill: this.fillColor, line: this.lineColor})
			} 
			this.fillPickShow = false
			
		},

		'pickerColor.line' () {
			if(typeof this.pickerColor.line === 'object') {
				this.lineColor = this.pickerColor.line.hex
				WhiteBoardService.changeColor({fill: this.fillColor, line: this.lineColor})
			}
			this.linePickShow = false
		},

		writer () {
			WhiteBoardService.init( this.writer, this.$refs.boardCanvas, this.$eventBus , this.whiteBoardData, this.studyPages)
			if(this.whiteBoardData.status === 'open') {
				// gsap.to(this.$refs.toolBar, 0.6, {x: 0, ease:Cubic.easeOut})
				this.$refs.tabMenu.changeTab( 1 )
				this.onChangeTab( 1 )
			} else {
				// gsap.to(this.$refs.toolBar, 0.6, {x: 40, ease:Cubic.easeOut})
			}
			WhiteBoardService.unActiveObject()
		},

		'whiteBoardData.status' ( newVal ) {
			if(this.writer) {
				if(newVal === 'open') {
					// gsap.to(this.$refs.toolBar, 0.6, {x: 0, ease:Cubic.easeOut})
					this.$refs.tabMenu.changeTab( 1 )
					this.onChangeTab( 1 )
				} else {
					// gsap.to(this.$refs.toolBar, 0.6, {x: 40, ease:Cubic.easeOut})
					this.fillPickShow = false
					this.linePickShow = false
					this.lineWidthPickShow = false
					this.opacityPickShow = false
				}
			}
			WhiteBoardService.unActiveObject()
		},

		'whiteBoardData.whiteMode' ( newVal ) {
			WhiteBoardService.init( this.writer, this.$refs.boardCanvas, this.$eventBus , this.whiteBoardData, this.studyPages)
			WhiteBoardService.toolBarEvent( this.tabList[this.$refs.tabMenu.active - 1].tool )
		}
	},


	mounted () {
		// gsap.set(this.$refs.toolBar, {x: 40})
		this.init()
		this.$eventBus.$on('whiteboard:changetool', () => {
			this.$refs.tabMenu.changeTab( 1 )
			this.onChangeTab( 1 )
		})
	},

	beforeDestroy () {
		WhiteBoardService.destroy()
		this.$eventBus.$off('whiteboard:changetool')
	},

	methods: {

		init () {
			this.pickerColor = {fill: { hex: this.fillColor }, line: { hex: this.lineColor }}
			this.lineWidth = this.whiteBoardData.lineWidth
			this.opacity = parseInt(this.whiteBoardData.opacity * 100)
			WhiteBoardService.init( this.writer, this.$refs.boardCanvas, this.$eventBus , this.whiteBoardData, this.studyPages)
		},

		onChangeTab ( idx ) {
			WhiteBoardService.toolBarEvent( this.tabList[idx-1].tool )
		},

		onClickTrash ( e ) {
			WhiteBoardService.toolBarEvent('trash')
		},

		async updateData ( data ) {
			const datas = await WhiteBoardService.updateData( data, true )
			const boardData = this.whiteBoardData.data
			if(this.whiteBoardData.whiteMode) {
				boardData['white'] = datas.data
			} else {
				boardData[this.studyPages[0]+'_'+this.studyPages[1]] = datas.data
			} 
			this.$store.dispatch('study/mainStudy/setWhiteBoard', {
				data: boardData,
				historyUndo: datas.undo, 
				historyRedo: datas.redo 
			})
		},

		onClickUndo () {
			WhiteBoardService.undo()
		},

		onClickRedo () {
			WhiteBoardService.redo()
		},

		onClickColor ( type ) {
			if(type === 'fill') {
				this.fillPickShow = !this.fillPickShow
				this.linePickShow = false
			} else {
				this.fillPickShow = false
				this.linePickShow = !this.linePickShow
			}
			this.lineWidthPickShow = false
			this.opacityPickShow = false
			clearTimeout(this.timer)
		},

		onClickLineWidth () {
			this.fillPickShow = false
			this.linePickShow = false
			this.lineWidthPickShow = !this.lineWidthPickShow
			this.opacityPickShow = false
			clearTimeout(this.timer)
		},

		onClickOpacity () {
			this.fillPickShow = false
			this.linePickShow = false
			this.lineWidthPickShow = false
			this.opacityPickShow = !this.opacityPickShow
			clearTimeout(this.timer)
			this.$refs.opacitySlider.refresh()
		},

		onChangeLineWidthTab ( idx ) {
			this.lineWidth = this.lineWidthList[idx-1]
			WhiteBoardService.changeLineWidth(this.lineWidth, true)
			this.$store.dispatch('study/mainStudy/setWhiteBoard', { lineWidth:  this.lineWidth })
			clearTimeout(this.timer)
			this.lineWidthPickShow = false
		},

		onOpacity () {
			WhiteBoardService.changeOpacity(this.opacity, true)
			this.$store.dispatch('study/mainStudy/setWhiteBoard', { opacity:  this.opacity })
			clearTimeout(this.timer)
			this.timer = setTimeout(() => {
				this.opacityPickShow = false
			}, 600)
		},

		onClickWhite ( e ) {
			this.$emit('white-mode', e.target.classList.contains('active'))
		}
	}
}
</script>

<style lang="scss">
#white-board {
	position: absolute;
   right: 0;
   top: 103px;
   width: 1562px;
   height: 962px;
	pointer-events: none;

	.board {
		position: absolute;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		pointer-events: none;
		border-top-right-radius: 30px;
		border-bottom-right-radius: 30px;
		overflow: hidden;
	}

	&.white {
		.board {
			background-color:#fff;
		}
	}

	&.open{
		pointer-events: all;
		.board.writer {
			pointer-events: all;
		}
	}

	.toolbar {
		position: absolute;
		right: -24px;
		bottom: 0;
		width: 65px;
		height: 883px;
		background-color: #e3c0a2;
		text-align: center;
		border-radius: 32px;
		overflow: hidden;
		box-sizing: border-box;
		box-shadow: 0px 5px 1px rgba(0,0,0,0.1);
		z-index: 99;

		&.st {
			height: 800px;
		}

		&.toolbar-enter-active{
			transition: all 0.6s $cubic-ease-in-out;
			.toolbar-wrap {
				transition: all 0.3s 0.3s;	
			}
		} 
		&.toolbar-leave-active {
			transition: all 0.6s $cubic-ease-in-out;
			.toolbar-wrap {
				transition: all 0.3s;	
			}
		}
		&.toolbar-enter, 
		&.toolbar-leave-to {
			height: 65px;
			.toolbar-wrap {
				opacity: 0;
			}
		}

		.toolbar-wrap {
			text-align: center;
			padding-top: 30px;
			will-change: transform;
		}

		.btn {
			position: relative;
			width: 100%;
			margin-top: 13px;
			&.white-btn {
				margin-top: 0;
				height: 38px;
				background: url('~@/assets/images/study/board_white_icon.png') no-repeat top center;
			}
			&.select-btn {
				height: 29px;
				background: url('~@/assets/images/study/board_select_icon.png') no-repeat top center;
			}
			&.pen-btn {
				height: 33px;
				background: url('~@/assets/images/study/board_pen_icon.png') no-repeat top center;
			}
			&.line-btn {
				height: 34px;
				background: url('~@/assets/images/study/board_line_icon.png') no-repeat top center;
			}
			&.text-btn {
				height: 32px;
				background: url('~@/assets/images/study/board_text_icon.png') no-repeat top center;
			}
			&.rect-btn {
				height: 31px;
				background: url('~@/assets/images/study/board_rect_icon.png') no-repeat top center;
			}
			&.triangle-btn {
				height: 28px;
				background: url('~@/assets/images/study/board_triangle_icon.png') no-repeat top center;
			}
			&.ellipse-btn {
				height: 33px;
				background: url('~@/assets/images/study/board_circle_icon.png') no-repeat top center;
			}
			&.trash-btn {
				height: 39px;
				background: url('~@/assets/images/study/board_trash_icon.png') no-repeat top center;
			}
			&.undo-btn {
				height: 38px;
				background: url('~@/assets/images/study/board_undo_icon.png') no-repeat top center;
			}
			&.redo-btn {
				height: 38px;
				background: url('~@/assets/images/study/board_redo_icon.png') no-repeat top center;
			}

			&.down,
			&.active {
				background-position-y: 100%;
			}

			&.fill-color {
				position: relative;
				width: 38px;
				height: 38px;
				border: solid 2px #fff;
			}

			&.line-color {
				position: relative;
				width: 38px;
				height: 38px;
				text-align: center;
				&:after {
					content: '';
					width: 18px;
					height: 18px;
					background-color: #e3c0a2;
					display: inline-block;
					vertical-align: middle;
					border: solid 2px #fff;
				}
				border: solid 2px #fff;
			}

			&.line-width-btn,
			&.opacity-btn {
				width: 52px;
				height: 37px;
				background: url('~@/assets/images/study/round_btn_bg.png') no-repeat;
			}
			&.opacity-btn {
				font-weight: 600;
				font-size: 15px;
			}
			
		}
		.txt {
			font-size: 12px;
			text-align:center;
			padding: 5px 0;
			@include underline();
		}
		input[type=range] {
			writing-mode: bt-lr; 
			-webkit-appearance: slider-vertical;
			width: 8px;
			height: 80px;
			padding: 0 5px;
			margin-top: 10px;
		}
	}

	.vc-compact{
		position: absolute;
		right: 35px;
		&.fill-color {
			top: 675px;
		}
		&.line-color {
			top: 730px;
		}

		&.color-picker-enter-active {
			transition: all 0.3s $cubic-ease-in-out;
		} 
		&.color-picker-leave-active {
			transition: none;
		}
		
		&.color-picker-enter, 
		&.color-picker-leave-to {
			opacity: 0;
			transform: translateX(10px);
		}
	}

	.line-width-pick {
		position: absolute;
		right: -18px;
    	top: 797px;
		width: 170px;
		height: 37px;
		background: url('~@/assets/images/study/round_btn_on_bg.png') no-repeat;
		pointer-events: none;
		&:after {
			content:'';
			position: absolute;
			right: 11px;
    		top: 9px;
			width: 31px;
			height: 17px;
			background: url('~@/assets/images/study/stroke_icon.png') no-repeat;
		}
		.stroke-tab {
			@include displayFlex;
			width: 125px;
    		height: 35px;
			.btn {
				pointer-events: all;
				border: solid 3px #efd9b6;
				border-radius: 50%;
				background-color: #000;
				margin-left: 2px;
				&.active{
					border-color: #FFF;
				}
			}
			.stoke-1 {
				width: 12px;
				height: 12px;
			}
			.stoke-2 {
				width: 15px;
				height: 15px;
			}
			.stoke-3 {
				width: 19px;
				height: 19px;
			}
			.stoke-4 {
				width: 21px;
				height: 21px;
			}
			.stoke-5 {
				width: 23px;
				height: 23px;
			}
		}
		&.st {
			top: 836px;
		}
	}

	.opacity-pick {
		position: absolute;
		right: -18px;
    	top: 847px;
		width: 170px;
		height: 37px;
		background: url('~@/assets/images/study/round_btn_on_bg.png') no-repeat;
		pointer-events: none;
		.txt {
			position: absolute;
			right: 2px;
    		top: 10px;
			width: 50px;
			font-weight: 600;
			font-size: 15px;
			text-align:center;
		}
		.opacity-slider {
			pointer-events: all;
			margin-left: 12px;
			.slider {
				background-color: #fff;
				border-top: solid 1px #dedede
			}
			.slider-process {
				background-color: #bd421e !important;
			}
			.slider-dot-handle {
				border-radius: 0px !important;
				background: url('~@/assets/images/study/opacity_slide_bar.png') no-repeat transparent !important;
				box-shadow: none !important;
			}
		}
		&.st {
			top: 886px;
		}
	}
}
</style>