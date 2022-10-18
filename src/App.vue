<template>
<div ref="scale-layer" id="scale-layer" :class="[$route.name, 'L'+$ucodeToLevel(studyLevel)]">
	<div ref="wrap" id="wrap">
		<div class="background"></div>
		<!-- <transition name="fade" mode="out-in"> -->
			<router-view></router-view>
		<!-- </transition> -->
		<vue-confirm-dialog></vue-confirm-dialog>
	</div>
	<debug-time v-if="$config.debugTime" @reset-now-time="onResetNowTime" />
</div>
</template>

<script>
import { gsap, Cubic, Expo } from 'gsap'
import { Draggable } from 'gsap/Draggable'
gsap.registerPlugin( Draggable )
gsap.config({ nullTargetWarn: false })

import DebugTime from './components/DebugTime'

var xmlHttp;
function srvTime() {
	try {
		xmlHttp = new XMLHttpRequest();
	}
	catch (err1) {
		try {
			xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch (err2) {
			try {
				xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch (eerr3) {}
		}
	}
	xmlHttp.open('HEAD', window.location.href.toString(), false);
	xmlHttp.setRequestHeader("Content-Type", "text/html");
	xmlHttp.send('');
	return xmlHttp.getResponseHeader("Date");
}


export default {
	name: 'App',

	components: {
		DebugTime
	},

	data () {
		return {
			windowSize: {
				width: 0,
				height: 0
			},
			
			nowTime: null,
			oldTime: null,
			preStartTime: null,
			mainStartTime: null,
			afterStartTime: null,
			classEndTime : null,
			globalTimer: null
		}
	},

	computed: {
		studyLevel() {
			if(this.$route.name === 'HomeworkOn') {
				if(this.$store.getters['myself/getHomeworkOnUcode']) {
					return this.$store.getters['myself/getHomeworkOnUcode']
				} else {
					if(!this.$store.getters['myself/getHomeworkOnUcode'] && this.$store.getters['myself/getHomeworkOnRestudys'].length > 0) {
						return this.$store.getters['myself/getHomeworkOnRestudys'][0]
					} else {
						return '';
					}
				}
			} else if(this.$route.name == "PreStudy" || this.$route.name == "MainStudy" || this.$route.name == "AfterStudy" ) {
				return this.studyInfo.ucode
			} else {
				const latestHwmkUcode = this.$store.getters['myself/getLatestHomeworkOff']
				return latestHwmkUcode ? latestHwmkUcode[1] : ''
			}
		}
	},

	watch: {
		studyStatus () {
			console.log("CHANGE STUDY STATUS :: ", this.studyStatus )
		}
	},

	created ()  {
		//axios error 설정
		this.$http.interceptors.response.use(
			response => {
				return response
			},
			error => {
				this.$confirm({
					message: '네트워크 오류입니다.<br />다시 시도해주세요.',
					submessage: 'Network error.<br />Please try again.',
					button: [
						{ name: '확인'} 
					],
					callback: () => {
						window.location.reload()
					}
				})
				return Promise.reject(error)
			}
		)

		if( !window.sessionStorage.getItem('viewerInfo') ) return
		const viewerInfo = JSON.parse(window.sessionStorage.getItem('viewerInfo'))

		// this.nowTime = new Date( srvTime() )
		
		// 현재시간 설정
		const serverTime = srvTime()
		if(serverTime) {
			this.nowTime = new Date( serverTime )
		} else {
			if(!window.sessionStorage.getItem('timeGap')) {
				this.nowTime = new Date( viewerInfo.server_time.replace(/-/g, "/") )
				window.sessionStorage.setItem('timeGap', this.nowTime - Date.now())
			} else {
				const date = new Date()
				date.setTime(date.getTime() + parseInt(window.sessionStorage.getItem('timeGap')))
				this.nowTime = date
			}
		}
		
		this.globalTimer = setInterval( this.onTimer, 1000 / 30 )
		this.onTimer()

		// 멤버정보 저장
		this.$store.dispatch('setMemberInfo', viewerInfo.mem_grps)

		// 회원정보 저장
		const me = _.find(viewerInfo.mem_grps, {me: true})
		this.$store.dispatch('setUserInfo', {
			pcd_seq: viewerInfo.pcd_seq,
			id: me.id,
			name: me.name,
			type: me.type
		})

		// 임시 학습정보
		if(this.$config.studyInfoType === 'session' && viewerInfo.start_classtime && viewerInfo.start_classUcode) {
			this.setStudyInfo(viewerInfo.start_classtime, viewerInfo.start_classUcode)
		}

		// 화상 room 번호
		if(viewerInfo.room_number && viewerInfo.is_test) {
			this.$store.dispatch('study/mainStudy/setRoomCode', viewerInfo.room_number)
		}

		// 학습 모드
		if(viewerInfo.study_mode) {
			this.$store.dispatch('setStudyMode', viewerInfo.study_mode)
		}
		

		this.$eventBus
			.$on('window:resize', this.resizeWindow)
			.$on('window:load', this.resizeWindow)
			.$on('setStudyInfo', this.setStudyInfo)
			.$on('studyframe:reciveMessage', this.onStudyFrameMessage)
	},

	mounted() {
		this.resizeWindow()
		this.onTimer()
	},

	methods: {
		resizeWindow ( e ) {
			this.windowSize.width = window.innerWidth;
			this.windowSize.height = window.innerHeight;
			const contentWidth = 1920;
			const contentHeight = 1080;
			const scaleX = this.windowSize.width/contentWidth;
			const scaleY = this.windowSize.height/contentHeight;
			const scale = Math.min(scaleX, scaleY);
			const left = (this.windowSize.width-(contentWidth * scale))/2;
			const top = (this.windowSize.height-(contentHeight * scale))/2;
			gsap.set(this.$refs['wrap'], {scaleX:scale, scaleY:scale, left:left, top:top});
			window.zoomScale = 1 / scale
		},

		setStudyInfo ( startTime, startUcode ) {
			if( !window.sessionStorage.getItem('viewerInfo')) return
			if(!startTime && !startUcode) return

			startTime = startTime.replace(/-/g, "/")
			
			if(this.studyMode === 'study') {
				const preStartTime = new Date( startTime )

				const classStartTime = new Date( startTime )
				classStartTime.setMinutes(preStartTime.getMinutes() + 5)
				
				const classEndTime = new Date( startTime )
				classEndTime.setMinutes(classEndTime.getMinutes() + 50)

				const level = this.$ucodeToLevel( startUcode )
				const part = this.$ucodeToPart( startUcode )
				const day = this.$ucodeToDay( startUcode )
				let isAtest = false
				if(LM.returnBookCode(level, part, day).indexOf('A-Test') > -1) {
					isAtest = true
				}

				this.$store.dispatch('setStudyInfo', {
					ucode: startUcode,
					preStartTime: preStartTime,
					classStartTime: classStartTime,
					classEndTime: classEndTime,
					isAtest: isAtest
				})
			} else {
				const classStartTime = new Date( startTime )
				const classEndTime = new Date( startTime )
				classEndTime.setMinutes(classEndTime.getMinutes() + 30)

				this.$store.dispatch('setStudyInfo', {
					ucode: startUcode,
					classStartTime: classStartTime,
					classEndTime: classEndTime
				})
			}
			
			this.onTimer()
		},

		

		onTimer () {
			if(!this.nowTime) return
			const now = Date.now()
			if(this.oldTime) {
				const dt = now - this.oldTime
				this.nowTime.setTime(this.nowTime.getTime() + dt)
			}
			this.oldTime = now

			if(this.studyInfo.classStartTime) {
				if(this.userInfo.type === 'ST' && this.studyMode === 'study') {
					if(this.nowTime >= (this.studyInfo.preStartTime - (10 * 60 * 1000)) && this.nowTime < this.studyInfo.preStartTime) {
						if(this.studyStatus !== 'beforeStudy') this.$store.dispatch('setStudyStatus', 'beforeStudy')
					} else if(this.nowTime >= this.studyInfo.preStartTime && this.nowTime < this.studyInfo.classStartTime) {
						if(this.studyStatus !== 'onPre') this.$store.dispatch('setStudyStatus', 'onPre')
					} else if(this.nowTime >= this.studyInfo.classStartTime && this.nowTime < this.studyInfo.classEndTime) {
						if(this.studyStatus !== 'onStudy') this.$store.dispatch('setStudyStatus', 'onStudy')
					} else {
						if(this.studyStatus !== 'off') this.$store.dispatch('setStudyStatus', 'off')
					}
				} else {
					if(this.nowTime >= (this.studyInfo.classStartTime - (10 * 60 * 1000)) && this.nowTime < this.studyInfo.classStartTime) {
						if(this.studyStatus !== 'beforeStudy') this.$store.dispatch('setStudyStatus', 'beforeStudy')
					} else if(this.nowTime >= this.studyInfo.classStartTime && this.nowTime < this.studyInfo.classEndTime) {
						if(this.studyStatus !== 'onStudy') this.$store.dispatch('setStudyStatus', 'onStudy')
					} else {
						if(this.studyStatus !== 'off') this.$store.dispatch('setStudyStatus', 'off')
					}
				}
			}

			this.$eventBus.now = this.nowTime
			this.$eventBus.$emit('timeupdate', this.nowTime)
		},

		onResetNowTime ( time ) {
			this.nowTime = new Date(this.$dateformat(this.nowTime, 'yyyy-mm-dd') + ' '+ time+':50')
			this.onTimer()
		},

		onStudyFrameMessage ( message ) {
			var msg = typeof message === 'string'? message : message.name
			switch( msg ) {
				case 'goto-home' :
					location.href = this.$baseUrl
				break
				case 'close-viewer' :
					self.close()
				break
				case 'confirm' :
					this.$confirm( message.value )
				break
				case 'fullscreen-video' :
					this.$eventBus.$emit('fullscreen-video', message.value)
				break
			}
		}
	}
}
</script>

<style lang="scss">
@import url('/LM_common/css/common.css');

/* layout */
div, span {
	will-change: auto;
}
html, body{
	color: #222;
	@include fullSize();
}
#scale-layer {
	position: fixed;
	overflow: hidden;
	background-color: #000;
	@include fullSize();
	.background {
		position: absolute;
		left: -50%;
		top: 0;
		width: 200%;
		height: 100%;
		background-color: #ebfcff;
		z-index: -1;
		// transition: background 1s;
	}
	&.Home .background {
		background-color: #cef8ff;
	}
	&.MainStudy .background {
		background-color: #eee7d4;
	}
	&.Study .background {
		background-color: #b2ecf7;
	}
	&.PreStudy,
	&.AfterStudy,
	&.HomeworkOn {
		&.L1 .background,
		&.L2 .background {
			background-color: #ffb6f9;
		}
		&.L3 .background,
		&.L4 .background {
			background-color: #fff48e;
		}
		&.L5 .background,
		&.L6 .background,
		&.L7 .background {
			background-color: #b2ecf7;
		}
	}
}
#wrap {
	position: relative;
	width: 1920px;
	height:1080px;
	overflow: visible;
	@include transformOrigin("top left");
}


/* confirm */
#vueConfirm {
	&.vc-overlay {
		background-color: rgba(0,0,0,0.8);
	}
	.vc-text-grid {
		height: 350px;
		@include displayFlex;
	}
	.vc-container {
		position: relative;
		width: 900px;
		will-change: transform;
		border-radius: 35px;
		&:before {
			content: '';
			height: 38px;
			background-color: #00bfe6;
			border-bottom: solid 4px #0099b8;
			border-radius: 35px 35px 0 0;
		}
	}
	.vc-btn{
		text-align: center;
		width: auto;
		min-width: 223px;
		height: 74px;
		margin: 0 5px;
		background-color: #006a80;
		border: solid 4px #006a80;
		color: #fff;
		font-size: 32px;
		border-radius: 15px;
		padding: 0 15px;
		box-shadow: 3px 3px 1px rgba(0,0,0,0.15);
		&.left {
			background-color: #eee;
			color: #666;
			border: solid 4px #ccc;
			box-shadow: 3px 3px 1px rgba(0,0,0,0.05);
		}
	}
	.vc-text{
		font-size: 36px;
		padding: 0;
	}
	.vc-text-grid{
		padding: 0;
	}
	.vc-btn-grid {
		border-radius: 0 0 35px 35px;
		height: 128px;
		border-top: solid 4px #e5e5e5;
		background-color: #f6f6f6;
	}
}



/* scroll-bar */
.scrollbar-track{
	opacity: 0.3 !important;
}
.scrollbar-track.show,
.scrollbar-track:hover {
  opacity: 0.6 !important;
}

.scrollbar-track.scrollbar-track-y {
	padding: 10px 0;
	box-sizing: border-box;
	width: 16px;
	border-radius: 8px;
	.scrollbar-thumb {
		width: 16px;
		border-radius: 8px;
	}
}




/* paginate */
.paginate { 
	padding: 40px 0; 
	text-align: center; 
	position: relative; 
}
.paginate a {
	position: relative;
	font-size: 32px;
	font-weight: 600;
	margin: 0px 25px;
}
.paginate a.active {
	color: #00a2d8;
	&:after {
		content: '';
		position: absolute;
		left: 50%;
		margin-left: -14px;
		bottom: -6px;
		display: inline-block;
		width: 32px;
		height: 4px;
		background-color: #00a2d8;
	}
}
.paginate .prev,
.paginate .next {
	position: relative;
	top: -3px;
	display: inline-block;
	vertical-align: middle;
	width: 64px;
	height: 68px;
	&.prev {
		background: url('~@/assets/images/common/page_prev.png') no-repeat;
	}
	&.next {
		background: url('~@/assets/images/common/page_next.png') no-repeat;
	}
	&.disabled {
		background-position-y: -68px;
		pointer-events: none;
	}
}
.paginate .break{
	display: none;
}

/**
* Transition
*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-long-enter-active,
.fade-long-leave-active {
  transition: opacity 0.5s;
}

.fade-long-enter,
.fade-long-leave-to {
  opacity: 0;
}


.fade-out-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-out-enter,
.fade-out-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  animation-duration: 0.4s;
  animation-fill-mode: both;
  animation-name: zoom;
  animation-timing-function: $back-ease-out;
}

.zoom-leave-active {
  animation-direction: reverse;
}

@keyframes zoom {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }

  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

.transition-up-enter-active,
.transition-up-leave-active {
  animation-duration: 0.5s;
  animation-fill-mode: both;
  animation-name: transition-up;
  animation-timing-function: $back-ease-out;
}
.transition-up-leave-active {
  animation-direction: reverse;
  animation-duration: 0.3s;
}

@keyframes transition-up {
  from {
	opacity: 0;
	transform: translateY(50px)
  }

  100% {
   opacity: 1;
	transform: translateY(0)
  }
}

</style>
