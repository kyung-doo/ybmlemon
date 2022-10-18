<template>
	<div id="points-chatting" v-if="this.studyInfo.ucode">
		<!-- tab-menu -->
		<ui-tab-menu
			ref="tabMenu"
			:active-index="1" 
			@tabmenu:change="onChangeTab">
			<ui-button></ui-button>
			<ui-button></ui-button>
		</ui-tab-menu>
		<!-- //tab-menu -->
		
		<!-- points -->
		<div :class="['content', 'points', menuIndex === 1 ? 'active' : '']">
			<div class="content-wrap">
				<div class="total-point">
					총 누계 Point <span>{{pointInfo.totalPoints}}</span> P
				</div>
				<div class="point-con">
					<div class="left-con">
						<div class="ranking-con">
							<ui-button ref="rankingBtn"
								:class="['ranking-btn', currentOwner === userInfo.type ? '' : 'disable']" 
								@button:click="showRanking">
								Monthly <span>Ranking</span>
							</ui-button>
							<div class="prev-month-points" v-if="showPrevMonthPoints">
								전월 획득 {{pointInfo.preMonthPoints}}P({{pointInfo.prevMonthRank}}등)
							</div>
						</div>
						<div class="class-points">
							<ul>
								<li class="pre">
									<div>Pre<span class="point"><strong>{{pointInfo.prePoint}}</strong>/10</span></div>
								</li>
								<li class="after">
									<div>After<span class="point"><strong>{{pointInfo.afterPoint}}</strong>/10</span></div>
								</li>
								<li :class="['hw-on', $ucodeToPartFullname(studyInfo.ucode) === 'Speaking' ? 'disable' : '']">
									<div>HW<span class="hw">ON</span><span class="point"><strong>{{pointInfo.homeworkOnPoint}}</strong>/10</span></div>
								</li>
								<li class="hw-off">
									<div>HW<span class="hw">OFF</span><span class="point"><strong>{{pointInfo.homeworkOffPoint}}</strong>/10</span></div>
								</li>
							</ul>
						</div>
					</div>
					<div class="right-con">
						<div class="progress-char" :style="{ height: studyPart === 'R'? '210px' : '185px' }">
							<swiper v-if="charactorNum > 0"
								class="swiper"
								ref="charactorSwiper"
								:options="{ 
									observer: true, 
									effect : 'fade'
								}">
								<swiper-slide class="swiper-no-swiping">
									<img :src="require(`@/assets/images/charactor/char${charactorNum}/char${charactorNum}_1.png`)" />
								</swiper-slide>
								<swiper-slide class="swiper-no-swiping">
									<img :src="require(`@/assets/images/charactor/char${charactorNum}/char${charactorNum}_2.png`)" />
								</swiper-slide>
								<swiper-slide class="swiper-no-swiping">
									<img :src="require(`@/assets/images/charactor/char${charactorNum}/char${charactorNum}_3.png`)" />
								</swiper-slide>
								<swiper-slide class="swiper-no-swiping">
									<img :src="require(`@/assets/images/charactor/char${charactorNum}/char${charactorNum}_4.png`)" />
								</swiper-slide>
								<swiper-slide class="swiper-no-swiping">
									<img :src="require(`@/assets/images/charactor/char${charactorNum}/char${charactorNum}_5.png`)" />
								</swiper-slide>
							</swiper>
						</div>
						<div v-if="studyPart === 'R'">
							<div class="main-point">Main <span><strong>{{pointInfo.mainPoint}}</strong>/20</span></div>
						</div>
						<div v-else>
							<div class="main-point">KT <span><strong>{{pointInfo.mainPointK}}</strong>/10</span></div>
							<div class="main-point" style="margin-top:0">FT <span><strong>{{pointInfo.mainPointF}}</strong>/10</span></div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- //points -->

		<!-- chatting -->
		<div :class="['content', 'chatting', menuIndex === 2 ? 'active' : '']">
			<div class="content-wrap">
				<!-- room-lists -->
				<div class="room-lists">
					<ul v-if="currentOwner === 'KT'">
						<li v-if="findRoomIn('KT')" class="kt">{{findMember('KT').name}}</li>
						<li v-if="findRoomIn('ST')" class="st">
							{{findMember('ST').name}}
							<ui-button v-if="currentOwner === userInfo.type"
								:title="!STPermissions.chatting ? '학생 채팅 권한 켜기' : '학생 채팅 권한 끄기'" 
								:class="['st-chat-btn', STPermissions.chatting ? 'on' : '']"
								@button:click="onClickSTChatting">
							</ui-button>
						</li>
						<li v-if="findRoomIn('FT')" class="ft">{{findMember('FT').name}}</li>
					</ul>
					<ul v-if="currentOwner === 'FT'">
						<li v-if="findRoomIn('FT')" class="ft">{{findMember('FT').name}}</li>
						<li v-if="findRoomIn('ST')" class="st">
							{{findMember('ST').name}}
							<ui-button v-if="currentOwner === userInfo.type" 
								:class="['st-chat-btn', STPermissions.chatting ? 'on' : '']"
								@button:click="onClickSTChatting">
							</ui-button>
						</li>
						<li v-if="findRoomIn('KT')" class="kt">{{findMember('KT').name}}</li>
					</ul>
				</div>
				<!-- room-lists -->

				<!-- message-con -->
				<div class="message-con">
					<div class="message-box">
						<smooth-scrollbar ref="scrollBar">
							<transition-group name="message-list" tag="ul">
								<li v-for="(list, index) in messageLists"
									:class="(list.id === userInfo.id) ? 'me':''"
									:key="index">
									<!-- <span>{{list.name}} [{{list.type}}] : {{list.text}}</span> <em>{{getDateFormat(list.date)}}</em> -->
									<div :class="['ico', list.type.toLowerCase()]"></div>
									<div class="name">{{list.name}}</div>
									<div class="msg-box">{{list.text}}</div>
								</li>
							</transition-group>
						</smooth-scrollbar>
					</div>
					<div :class="['input-con', userInfo.type === 'ST' && !STPermissions.chatting ? 'disable' : '']">
						<input ref="messageText" type="text" v-on:keyup.enter="sendMessage()">
						<ui-button @button:click="sendMessage()" />
					</div>
				</div>
				<!-- message-con -->
			</div>
		</div>
		<!-- //chatting -->

		<div v-show="showAni" class="point-ani">
			<ui-sequence
				ref="sequence" 
				source="point"
				name="point_"
				:total-frames="108"
				:fps="30"
				@finish="() => this.showAni = false">
			</ui-sequence>
			<h4 ref="aniTitle">만점 포인트 획득!</h4>
		</div>

	</div>
</template>

<script>

import _ from 'lodash'
import AudioControl from '@/libs/audioControl'
import { gsap, Cubic, Back } from 'gsap'
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'

export default {
	name: 'pointsChatting',

	components: {
      Swiper,
      SwiperSlide
   },

	props: {
		charactorNum: { type: Number, default: 0 }
	},

	data() {
		return {
			menuIndex: 1,
			isInit: false,
			pointAudio: null,
			showAni: false
		}
	},

	computed: {

		currentOwner () {
			return this.$store.getters['study/mainStudy/getOwner']
		},

		showPrevMonthPoints () {
			return this.$eventBus.now.getDate() < 8
		},
		
		roomLists () {
			return [
				this.userInfo, 
				...this.$store.getters['study/mainStudy/getRoomLists']
			]
		},

		findRoomIn () {
			return ( type ) => {
				return this.roomLists.find( x => x.type === type)
			}
		},

		findMember () {
			return ( type ) => {
				return _.find(this.memberInfo, {type: type})
			}
		},

		messageLists () {
			return this.$store.getters['study/mainStudy/getMessages']
		},

		classMembers () {
			return this.$store.getters['study/mainStudy/getClassMembers']
		},

		STPermissions () {
			return this.$store.getters['study/mainStudy/getSTPermissions']
		},

		studyPart () {
			return this.studyInfo.ucode.split('_')[1].slice(0, 1)
		}

	},

	watch: {

		messageLists () {
			this.$forceUpdate()
			setTimeout(()=> {
				const h = this.$refs.scrollBar.scrollbar.getSize().content.height - this.$refs.scrollBar.scrollbar.getSize().container.height
				this.$refs.scrollBar.scrollbar.scrollTo(0, h, 600)
			}, 100)
			if(this.isInit) {
				this.isInit = false
				return
			}
			this.menuIndex = 2
			this.$refs.tabMenu.changeTab(2)
		},

		charactorNum ( newVal ) {
			setTimeout(()=> {
				this.checkCharactor( 0 )
			}, 100)

		},

		'pointInfo.mainPoint' (newVal, oldVal) {
			if(oldVal === null) return
			this.menuIndex = 1
			this.$refs.tabMenu.changeTab(1)
			this.pointAudio.stop()
			this.pointAudio.play()
			if(parseInt(newVal) == 20) {	
				this.showAni = true
				this.$refs.sequence.gotoAndPlay(1)
				gsap.set(this.$refs.aniTitle, {opacity:0, scaleX: 0.5, scaleY: 0.5 })
				gsap.to(this.$refs.aniTitle, 0.6, {delay:0.5, opacity:1, scaleX: 1, scaleY: 1, ease: Back.easeOut})
				gsap.to(this.$refs.aniTitle, 0.3, {delay:2, opacity:0})	
			}
			this.checkCharactor()
		},

		'pointInfo.homeworkOffPoint' (newVal, oldVal) {
			if(oldVal === null) return
			this.menuIndex = 1
			this.$refs.tabMenu.changeTab(1)
			this.pointAudio.stop()
			this.pointAudio.play()
		},

		'STPermissions.chatting' ( newVal ) {
			if(!newVal && this.userInfo.type === 'ST') {
				this.$refs.messageText.value = ''
				this.$refs.messageText.blur()
			}
		}
	},

	mounted () {
		this.pointAudio = new AudioControl('point.mp3')
	},

	methods: {
		init () {
			this.isInit = true
		},
		onChangeTab ( idx ) {
			this.menuIndex = idx
		},

		sendMessage () {
			const msg = this.$refs.messageText.value
			if(msg !== '') {
				this.$emit('send-message', msg)
				this.$refs.messageText.value=''
			}
		},

		getDateFormat( date ) {
			return this.$dateformat(new Date(date), 'mm/dd TT h:MM')
		},

		showRanking () {
			this.$emit('show-ranking')
		},

		onClickSTChatting () {
			this.$emit('st-chatting-permission')
		},

		checkCharactor ( speed = 1000) {
			if(this.$refs.charactorSwiper) {
				if(this.pointInfo.mainPoint < 5) {
					this.$refs.charactorSwiper.$swiper.slideTo(0, speed)
				} else if(this.pointInfo.mainPoint >= 5 && this.pointInfo.mainPoint < 10) {
					this.$refs.charactorSwiper.$swiper.slideTo(1, speed)
				} else if(this.pointInfo.mainPoint >= 10 && this.pointInfo.mainPoint < 15) {
					this.$refs.charactorSwiper.$swiper.slideTo(2, speed)
				} else if(this.pointInfo.mainPoint >= 15 && this.pointInfo.mainPoint < 20) {
					this.$refs.charactorSwiper.$swiper.slideTo(3, speed)
				} else if(this.pointInfo.mainPoint === 20){
					this.$refs.charactorSwiper.$swiper.slideTo(4, speed)
				}
			}
		}
	}
}
</script>

<style lang="scss">

#points-chatting {
	position: relative;
	height: 391px;

	.tab-menu {
		position: absolute;
		left:0;
		top:0;
		@include displayFlex;
		width: 100%;
		height: 40px;
		z-index: 3;
		.btn {
			display: block;
			width: 50%;
			height: 100%;
		}
	}

	.content {
		position: absolute;
		width: 100%;
		height: 391px;
		box-sizing: border-box;
		padding-top: 40px;
		&.active {
			z-index: 2;
			background-position-y: -391px;
		}
	}

	.content-wrap {
		padding: 5px 4px;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
	}

	.content.points {
		background-image: url('~@/assets/images/study/point_bg.png');
		background-repeat: no-repeat;
		.total-point {
			@include displayFlex;
			height: 64px;
			font-weight: 600;
			font-size: 23px;
			letter-spacing: -1px;
			color: #09122b;
			> span {
				font-weight: 600;
				font-size: 30px;
				color: #d82921;
				margin-left: 10px;
				margin-right: 5px;
			}
		}
		.point-con {
			@include displayFlex;
			width: 100%;
			height: 273px;
    		margin-top: 3px;
		}
		.left-con,
		.right-con {
			width: 50%;
			height: 100%;
		}

		.right-con { 
			@include displayFlex;
			flex-direction: column;
			padding-left: 3px;
		}

		.ranking-con {
			@include displayFlex;
			flex-direction: column;
			height: 115px;

			.ranking-btn {
				display: block;
				width: 128px;
				height: 64px;
				border-radius: 20px;
				background-color: #72a7ad;
				color: #c2d7d9;
				font-size: 22px;
				font-weight: 500;
				text-shadow: 1px 1px 1px rgba(0,0,0,0.6);
				box-shadow: 1px 1px 1px rgba(0,0,0,0.4);
				transition: all 0.3s;
				line-height: 23px;
				&:hover,
				&.down {
					background-color: #7979b2;
				}
				> span {
					font-weight: 500;
					color: #fff;
				}
				&.disable {
					pointer-events: none;
				}
			}

			.prev-month-points {
				margin-top: 10px;
				font-size: 14px;
				color: #a8aeb2;
			}
			
		}

		.class-points {
			margin-top: 3px;
			height: 155px;
			ul {
				height: 134px;
    			margin: 12px 5px;
			}
			li {
				position: relative;
				height: 25%;
				> div {
					font-size: 19px;
					color: #474a4c;
					font-weight: 600;
					line-height: 30px;
					
				}
				.point {
					position: absolute;
					right: 0px;
					top: 2px;
					color: #a8aeb2;
					font-weight: 600;
					> strong {
						color: #474a4c;
						font-weight: 600;
					}
				}
				.hw {
					display: inline-block;
					width:30px;
					height: 20px;
					background-color: #7da6ac;
					color: #fff;
					font-size: 12px;
					font-weight: 500;
					line-height: 22px;
					border-radius: 10px;
					text-align: center;
					vertical-align: middle;
					margin-left: 2px;
				}
				&.disable {
					opacity: 0.3;
				}
			}

		}
		
		.progress-char {
			@include displayFlex;
			width: 124px;
			height: 210px;
			border-radius: 15px;
			background-color: #fff;
			margin-top: 5px;
			overflow: hidden;
		}

		.main-point {
			@include displayFlex;
			height: 35px;
			font-size: 19px;
			color: #474a4c;
			font-weight: 600;
			margin-top: 8px;
			> span {
				display: inline-block;
				width: 70px;
				height: 28px;
				background-color: #eaeef0;
				border-radius: 15px;
				margin-left: 5px;
				text-align: center;
				line-height: 30px;
				color: #a8aeb2;
				font-size: 19px;
				font-weight: 600;
				> strong {
					color: #474a4c;
					font-size: 19px;
					font-weight: 600;
				}
			}
		}
		
	}

	.content.chatting {
		background-image: url('~@/assets/images/study/chatting_bg.png');
		background-repeat: no-repeat;
		.room-lists {
			position: relative;
			width: 100%;
			height: 77px;
			box-sizing: border-box;
			background-color: #d4dce1;
			border-radius: 15px;
			> ul {
				padding: 8px 12px;
			}
			> ul > li {
				position: relative;
				height: 20px;
				font-weight: 400;
				font-size: 18px;
				color: #09122b;
				padding-left: 20px;
				&:before{
					position: absolute;
					left:0;
					top:1px;
					content:'';
					display: inline-block;
					width: 17px;
					height: 17px;
					border-radius: 50%;
					text-align: center;
					color: #d4dce1;
					font-size: 13px;
					font-weight: 500;
    				line-height: 18px;
				}
				&.kt:before{
					content:'K';
					background-color: #0071bc;
				}
				&.ft:before{
					content:'F';
					background-color: #fb723b;
				}
				&.st:before{
					content:'S';
					background-color: #42b63b;
				}
				&.ob:before{
					background-color: #8c6239;
				}
				> span {
					position: absolute;
					right: 5px;
					top: 0;
					width: 39px;
					height: 23px;
					background-color: #a9b8c2;
					border-radius: 15px;
					text-align:center;
					color: #fff;
					font-size: 13px;
					font-weight: 500;
    				line-height: 22px;
				}
				.st-chat-btn {
					position: absolute;
					right: 0;
					top: 0;
					display: inline-block;
					width: 27px;
					height: 24px;
					background: url('~@/assets/images/study/chatting_btn.png') no-repeat;
					background-position-y: -24px;
					&.on {
						background-position-y: 0;
					}
				}
			}
		}

		.message-con{
			width: 100%;
			height: 258px;
			background-color: #b8e9f4;
			border-radius: 15px;
			margin-top: 5px;
			overflow: hidden;
			.message-box {
				width: 100%;
				height: 206px;
				padding: 15px 0;
				ul {
					padding: 0 15px;
					box-sizing: border-box;
				}
				li {
					position: relative;
					display: block;
					overflow-wrap: break-word;
					color: #333;
					margin-top: 12px;
					box-sizing: border-box;
					padding-left: 22px;
					&:first-child{
						margin-top: 0;
					}
					.ico {
						position: absolute;
						left:0;
						top:8px;
					}
					.ico:before {
						content:'';
						display: block;
						width: 17px;
						height: 17px;
						border-radius: 50%;
						text-align: center;
						color: #b8e9f4;
						font-size: 13px;
						font-weight: 500;
						line-height: 18px;
					}
					.ico.kt:before{
						content:'K';
						background-color: #0071bc;
					}
					.ico.ft:before{
						content:'F';
						background-color: #fb723b;
					}
					.ico.st:before{
						content:'S';
						background-color: #42b63b;
					}
					.ico.ob:before{
						background-color: #8c6239;
					}
					.name {
						font-size: 12px;
						font-weight: 500;
						color: #636363;
					}

					.msg-box {
						position: relative;
						display: inline-block;
						box-sizing: border-box;
						max-width: 218px;
						padding: 6px 15px;
						border-radius: 15px;
						background-color: #fff;
						font-size: 16px;
						font-weight: 400;
						margin-top: 5px;
						&:before {
							content:'';
							display: inline-block;
							width: 9px;
							height: 7px;
							position: absolute;
							left: -2px;
							top: 2px;
							background: url('~@/assets/images/study/msg_arrow.png') no-repeat;
						}
					}
					&.message-list-enter-active, 
					&.message-list-leave-active {
						transition: all 0.6s;
						.msg-box {
							transform-origin: top left;
							transition: all 0.4s;
							transition-delay: 0.2s;
						}
					}
					&.message-list-enter, 
					&.message-list-leave-to {
						opacity: 0;
						// transform: translateY(10px);
						.msg-box {
							opacity: 0;
							transform: scale(0.5)
						}
					}
				}
			}
			

			.scrollbar-thumb {
				background-color: rgba(255,255,255,1);
				&:hover {
					background-color: rgba(255,255,255,1);
				}
			}
			.scrollbar-track {
				opacity: 1 !important;
				background-color: rgba(255,255,255,0);
				cursor: pointer;
			}
			.scrollbar-track-y {
				width: 10px;
			}
			.scrollbar-thumb {
				width: 10px;
				border-radius: 5px;
			}
			.input-con {
				width: 100%;
				height: 51px;
				background-color: #fff;
				input[type="text"] {
					border: none;
					width: 226px;
					height: 100%;
					padding: 15px;
					outline: none;
					font-size: 19px;
					font-weight: 500;
					vertical-align: middle;
				}
				button {
					width: 39px;
					height: 39px;
					vertical-align: middle;
					background: url('~@/assets/images/study/send_icon.png') no-repeat;
					&.down,
					&:hover {
						background-position-y: -39px;
					}
				}
				&.disable {
					pointer-events: none;
					opacity: 0.5;
				}
			}

		}

		
	}

	.point-ani {
		position: absolute;
		left: 0;
		top: -550px;
		h4 {
			position: absolute;
			left: 913px;
			top: 373px;
			font-size: 50px;
			font-weight: 600;
			width: 370px;
			text-align: center;
			color: #000000;
		}
	}
    
}
</style>