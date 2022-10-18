<template>
	<div id="study">

		<!-- pre-wait -->
		<div v-if="initView && userInfo.type === 'ST' && $route.name === 'Study' && studyStatus ==='beforeStudy'" class="pre-wait">

			<!-- top-title -->
			<div class="top-title">Today's Class</div>
			<!-- //top-title -->

			<!-- top-info -->
			<div class="top-info">
				<div class="date-bg"></div>
				<div class="level">{{$ucodeToLevel(studyInfo.ucode)}}</div>
				<div class="part-day">{{$ucodeToPartFullname(studyInfo.ucode)}} - Day {{$ucodeToDay(studyInfo.ucode)}}</div>
				<div class="date">{{studyDate}}</div>
				<div class="time">{{studyTime}}</div>
			</div>
			<!-- //top-info -->

			<!-- book-con -->
			<div class="book-con">
				<div class="cover">
					<img v-if="studyInfo.bookMeta" :src="$config.CMS_URL + studyInfo.bookMeta.cover_img_thumb" />
				</div>
				<div v-if="studyInfo.bookMeta" class="title">{{studyInfo.bookMeta.book_title}}</div>
				<div v-if="studyInfo.bookMeta" class="topic">{{studyInfo.bookMeta.topic}}</div>
			</div>
			<!-- //book-con -->

			<!-- alarm-con -->
			<div class="alarm-con">
				
				<clock :minut="String(preMinut)" :second="String(preSecond)" study-type="pre" />

				<label class="alarm-chk">
					<input type="checkbox" v-model="chkAlarm">
					<span></span>
					Alarm
				</label>
			</div>
			<!-- //alarm-con -->

		</div>
		<!-- //pre-wait -->


		<!-- pre-start -->
		<div v-if="initView && userInfo.type === 'ST' && $route.name === 'Study' && studyStatus ==='onPre'" class="pre-start">

			<!-- top-title -->
			<div class="top-title">Today's Class</div>
			<!-- //top-title -->

			<!-- top-info -->
			<div class="top-info">
				<div class="level">{{$ucodeToLevel(studyInfo.ucode)}}</div>
				<div class="part-day">{{$ucodeToPartFullname(studyInfo.ucode)}} - Day {{$ucodeToDay(studyInfo.ucode)}}</div>
				<div class="date">{{studyDate}}</div>
				<div class="time">{{studyTime}}</div>
			</div>
			<!-- //top-info -->

			<div class="start-con">
				<div class="title">
					수업시작 시간입니다.<br />
					<span>시작버튼을 클릭</span>하세요.
				</div>
				<div class="time">{{nowTime}}<span>{{nowSecond}}</span></div>
				<ui-button class="pre-start-btn" 
					@button:click="onStartPre">
					Pre Class 수업 시작
				</ui-button>
			</div>

		</div>
		<!-- //pre-start -->
		

		<!-- after-wait -->
		<div v-if="initView && userInfo.type === 'ST' && studyStatus ==='onStudy' && studyInfo.afterWait && studyInfo.mainPassed" class="after-wait">
			<!-- top-title -->
			<div class="top-title">After Class</div>
			<!-- //top-title -->

			<!-- top-info -->
			<div class="top-info">
				<div class="level">{{$ucodeToLevel(studyInfo.ucode)}}</div>
				<div class="part-day">{{$ucodeToPartFullname(studyInfo.ucode)}} - Day {{$ucodeToDay(studyInfo.ucode)}}</div>
			</div>
			<!-- //top-info -->

			<div class="after-con">
				<clock :minut="String(afterMinut)" :second="String(afterSecond)" study-type="after" />
				<div class="now-con">
					<div class="date">{{nowDate}}</div>
					<div class="time">{{nowTime}}<span>{{nowSecond}}</span></div>
				</div>
				<div class="start-date">
					<div class="date">{{$dateformat(studyInfo.classEndTime, 'yyyy.mm.dd(ddd)')}}</div>
					<div class="time">~ {{$dateformat(studyInfo.classEndTime, 'HH:MM')}}<span>까지 시작해주세요</span></div>
				</div>
				<ui-button class="after-start-btn" 
					@button:click="onStartAfter">
					After Class 지금 시작
				</ui-button>
				<label class="alarm-chk">
					<input type="checkbox" v-model="chkAlarm">
					<span></span>
					Alarm
				</label>
			</div>

		</div>
		<!-- //after-wait -->

		
		<!-- router -->
		<router-view  v-if="$route.name !== 'Study'"></router-view>
		<!-- //router -->

		<!-- study-header -->
		<template v-if="studyInfo.bookMeta && !fullscreenVideo">
			<template v-if="$route.name !== 'MainStudy'">
				<study-header 
					:level="$ucodeToLevel(studyInfo.ucode)" 
					:part="$ucodeToPart(studyInfo.ucode)"
					:day="$ucodeToDay(studyInfo.ucode)" 
					:Bcode="studyInfo.bookMeta.Bcode"
					:Bno="studyInfo.bookMeta.Bno"
					:Lno="studyInfo.bookMeta.Lno"
					:Btitle="studyInfo.bookMeta.book_title">
				</study-header>
			</template>
			<template v-else>
				<study-header 
					v-if="$ucodeToPart(studyInfo.ucode) === 'R' || ($ucodeToPart(studyInfo.ucode) === 'S' && currentOwner === 'KT')"
					:level="$ucodeToLevel(studyInfo.ucode)" 
					:part="$ucodeToPart(studyInfo.ucode)"
					:day="$ucodeToDay(studyInfo.ucode)" 
					:Bcode="studyInfo.bookMeta.Bcode"
					:Bno="studyInfo.bookMeta.Bno"
					:Lno="studyInfo.bookMeta.Lno"
					:Btitle="studyInfo.bookMeta.book_title">
				</study-header>
				<study-header 
					v-if="$ucodeToPart(studyInfo.ucode) === 'S' && currentOwner === 'FT'"
					:level="$ucodeToLevel(studyInfo.ucode)" 
					:part="$ucodeToPart(studyInfo.ucode)"
					:day="$ucodeToDay(studyInfo.ucode)" 
					:Bcode="studyInfo.bookMetaF.Bcode"
					:Bno="studyInfo.bookMetaF.Bno"
					:Lno="studyInfo.bookMetaF.Lno"
					:Btitle="studyInfo.bookMetaF.book_title">
				</study-header>
			</template>
		</template>
		<!-- //study-header -->

		<!-- exit-button -->
		<exit-button />
		<!-- //exit-button -->
	</div>
</template>

<script>

import StudyHeader from '@/components/study/StudyHeader'
import Clock from '@/components/study/Clock'
import AudioControl from '@/libs/audioControl'

export default {
    
	name: 'study',

	components: {
		StudyHeader,
		Clock
	},

	data () {
		return {
			nowDate: this.$dateformat(this.$eventBus.now, 'yyyy.mm.dd(ddd)'),
			nowTime: this.$dateformat(this.$eventBus.now, 'HH:MM'),
			nowSecond: this.$dateformat(this.$eventBus.now, 'ss'),
			chkAlarm: this.$store.getters['getAlarm'],
			alarmAudio: new AudioControl('alarm.mp3'),
			startAlarmAudio1: new AudioControl('alram_satart_1.mp3'),
			startAlarmAudio2: new AudioControl('alram_satart_2.mp3'),
			preMinut: 0,
			preSecond: 0,
			afterMinut: 0,
			afterSecond: 0,
			fullscreenVideo: false,
			initView: false,
			timer: null
		}
	},

	computed: {
		studyDate () {
			if(this.studyMode === 'study') {
				return this.$dateformat(this.studyInfo.preStartTime, 'yyyy.mm.dd(ddd)')
			} else {
				return this.$dateformat(this.studyInfo.classStartTime, 'yyyy.mm.dd(ddd)')
			}
		},

		studyTime () {
			if(this.studyMode === 'study') {
				return this.$dateformat(this.studyInfo.preStartTime, 'HH:MM')+' ~'
			} else {
				return this.$dateformat(this.studyInfo.classStartTime, 'HH:MM')+' ~'
			}
		},

		currentOwner () {
			return this.$store.getters['study/mainStudy/getOwner']
		},
	},

	watch: {
		studyStatus () {
			this.changeStudyStatus()
		},

		'$route.path' () {
			if(this.$route.name === 'Study') {
				this.init()
			} else {
				this.fullscreenVideo = false
			}
		}
	},

	mounted() {
		if( !this.userInfo.id ) {
			this.$router.push({name: 'Error'})
			return
		}
		this.init()
		if(this.userInfo.type === 'ST') {
			this.$eventBus.$on('fullscreen-video', ( flag )=> {
				this.fullscreenVideo = flag
			})
		}
	},

	beforeDestroy () {
		this.alarmAudio.destroy()
		this.startAlarmAudio1.destroy()
		this.startAlarmAudio2.destroy()
		clearTimeout(this.timer);
		this.$eventBus
			.$off('timeupdate', this.onTimeupdate)
			.$off('fullscreen-video')
	},

	methods: {
		async init() {
			let result = await this.$http.post(`${this.$config.LMSApiURL}/getStartViewer`, { 
				pcd_seq: this.userInfo.pcd_seq
			})

			if(result.data.is_last && parseInt(result.data.is_last) === 1) {
				this.$confirm({
					message: '모든 수업이 완료되었습니다.',
					button: [{ name: '확인' }],
					callback: () => {
						if(this.userInfo.type === 'ST') {
							location.href = this.$baseUrl
						} else {
							self.close();
						}
					}
				})
				return
			}

			if(result.data.new_pcd_seq) {
				const viewerInfo = JSON.parse(window.sessionStorage.getItem('viewerInfo'))
				const newViewerInfo = Object.assign(viewerInfo, {pcd_seq : result.data.new_pcd_seq})
				window.sessionStorage.setItem('viewerInfo', JSON.stringify(newViewerInfo))
				this.$store.dispatch('setUserInfo', {
					pcd_seq: result.data.new_pcd_seq
				})
			}

			if(this.$config.studyInfoType === 'api') {
				this.$eventBus.$emit('setStudyInfo', result.data['start_classtime'], result.data['start_classUcode'])
			}

			if(this.userInfo.type === 'ST') {
				this.$store.dispatch('setStudyInfo', { 
					prePassed: parseInt(result.data['pre_passed']), 
					mainPassed: parseInt(result.data['main_passed'])
				})
			}
			
			this.$store.dispatch('setStudyInfo', { 
				otday: parseInt(result.data['ot']) === 1 ? true: false
			})

			result = await this.$http.get(`${this.$config.CMSApiURL}/getBookMeta.php?Ucode=${this.studyInfo.ucode}`)

			this.$store.dispatch('setStudyInfo', { bookMeta: result.data })

			if(this.$ucodeToPart(this.studyInfo.ucode) === 'S') {
				result = await this.$http.get(`${this.$config.CMSApiURL}/getBookMeta.php?Ucode=${this.studyInfo.ucode}&cls_code=SCF&ot=${this.studyInfo.otday ? '1' : '1'}`);
				if(this.$ucodeToLevel(this.studyInfo.ucode) > 4) {
					if(result.data.Bno === 'intro'){
						result.data.Bno = '1';
						result.data.book_title = result.data.book_title.replace('intro', '1');
					}
				}
				if(this.studyInfo.bookMeta.book_title.indexOf('A-Test') > -1) {
					result.data.book_title = 'A-Test'	
				}
				this.$store.dispatch('setStudyInfo', { bookMetaF: result.data })
			}

			this.$eventBus.$on('timeupdate', this.onTimeupdate)
			this.changeStudyStatus( true )
		},

		changeStudyStatus ( isFirst = false ) {
			if(this.userInfo.type === 'ST') {
				if(this.studyStatus === 'beforeStudy') {
					if(this.$router.currentRoute.name !== 'Study') this.$router.push({name: 'Study'})
				} else if(this.studyStatus === 'onPre') {
					if(isFirst) {
						if(this.$router.currentRoute.name !== 'PreStudy') this.$router.push({name: 'PreStudy'})
					}
					// this.$http.post(`${this.$config.LMSApiURL}/setStartClass`, { 
					// 	pcd_seq: this.userInfo.pcd_seq,
					// 	user_type: this.userInfo.type
					// })
				} else if(this.studyStatus === 'onStudy') {
					if( this.studyInfo.mainPassed === 0 ) {
						if(isFirst) {
							if(this.studyInfo.prePassed === 0 && this.studyMode === 'study') {
								this.$confirm({
									message: `'Pre-Class를 놓쳤군요.<br />다음 시간에는 꼭~'`,
									button: [{ name: '확인' }]
								})
								if(this.$router.currentRoute.name !== 'MainStudy') this.$router.push({name: 'MainStudy'})
							} else {
								if(this.$router.currentRoute.name !== 'MainStudy') this.$router.push({name: 'MainStudy'})
							}
						} else {
							if(this.studyInfo.prePassed === 0) {
								let msg = ''
								if(this.$ucodeToPart(this.studyInfo.ucode) === 'R') {
									msg = '휴대폰을 끄고 수업에 집중해주세요.<br />이제 Main class를 시작합니다.'
								} else {
									msg = 'Speaking 시간에는 한국말을 사용할 수 없습니다.<br />이제 Main class 를 시작합니다.'
								}
								this.$confirm({
									message: msg,
									button: [{ name: '확인' }]
								})
								if(this.$router.currentRoute.name !== 'MainStudy') this.$router.push({name: 'MainStudy'})
							} else {
								if(this.$router.currentRoute.name !== 'MainStudy') this.$router.push({name: 'MainStudy'})
							}
						}
					} else {
						if(!this.studyInfo.afterWait) {
							if(this.$router.currentRoute.name !== 'AfterStudy') this.$router.push({name: 'AfterStudy'})
						}
					}

					this.$http.post(`${this.$config.LMSApiURL}/setStartClass`, { 
						pcd_seq: this.userInfo.pcd_seq,
						user_type: this.userInfo.type
					})

				} else {
					if(isFirst) {
						this.$confirm({
							message: '수업시간이 아닙니다.',
							button: [{ name: '확인' }],
							callback: () => {
								if(this.studyMode === 'study') {
									location.href = this.$baseUrl
								} else {
									self.close()
								}
							}
						})
					} else {
						if(this.studyInfo.afterWait) {
							this.$confirm({
								message: '수업이 종료되었습니다.',
								button: [{ name: '확인' }],
								callback: () => {
									if(this.studyMode === 'study') {
										location.href = this.$baseUrl
									} else {
										self.close()
									}
								}
							})
						}
					}
				}
			} else {
				if(this.studyStatus === "beforeStudy" || this.studyStatus === "onStudy") {
					if(isFirst) {
						if(this.$router.currentRoute.name !== 'MainStudy') this.$router.push({name: 'MainStudy'}).catch()
						this.$http.post(`${this.$config.LMSApiURL}/setStartClass`, { 
							pcd_seq: this.userInfo.pcd_seq,
							user_type: this.userInfo.type
						})
					}
				} else {
					if(isFirst) {
						this.$confirm({
							message: '수업시간이 아닙니다.',
							button: [{ name: '확인' }],
							callback: () => {
								self.close()
							}
						})
					}
				}
				
			}
			if(!this.initView) {
				setTimeout(() => {
					this.initView = true
				}, 100)
			}
		},

		onStartPre() {
			// this.$fullscreen()
			this.$router.push({name: 'PreStudy'})
		},

		onStartAfter () {
			this.$router.push({name: 'AfterStudy'})
			this.$store.dispatch('setStudyInfo', {afterWait: false})
		},

		onTimeupdate ( now ) {
			if(this.userInfo.type === 'ST') {

				this.nowTime = this.$dateformat(now, 'HH:MM')
				this.nowSecond = this.$dateformat(now, 'ss')

				if( this.$route.name === 'Study' && this.studyStatus === 'beforeStudy') {
					let preCount = this.studyMode === 'study' ? this.studyInfo.preStartTime - now : this.studyInfo.classStartTime - now
					if(preCount < 0) preCount = 0
					this.preMinut = parseInt(preCount/60/1000)
					this.preSecond = this.$addZero(parseInt(preCount/1000)%60, 2)
					if(this.chkAlarm === true) {
						if(parseInt(preCount/1000) === 300) {
							this.alarmAudio.play()
							this.timer = setTimeout(() => {
								this.startAlarmAudio1.play()
							}, 4000)
						}
						if(parseInt(preCount/1000) === 120) {
							this.alarmAudio.play()
							this.timer = setTimeout(() => {
								this.startAlarmAudio2.play()
							}, 4000)
						}
						if([30, 5].indexOf( parseInt(preCount/1000) ) > -1) {
							this.alarmAudio.play()
						}
					}
				}

				if( this.$route.name === 'Study' && this.studyInfo.mainPassed && this.studyInfo.afterWait && this.studyStatus === 'onStudy') {
					let afterCount = this.studyInfo.classEndTime - now
					if(afterCount < 0) afterCount = 0
					this.afterMinut = parseInt(afterCount/60/1000)
					this.afterSecond = this.$addZero(parseInt(afterCount/1000)%60, 2)
					if(this.chkAlarm === true) {
						if(parseInt(afterCount/1000) === 300) {
							this.alarmAudio.play()
						}
						if(parseInt(afterCount/1000) === 120) {
							this.alarmAudio.play()
						}
						if([30, 5].indexOf( parseInt(afterCount/1000) ) > -1) {
							this.alarmAudio.play()
						}
					}
				}
				
			}
		}
	}
}
</script>

<style lang="scss">
#study{
	@include fullSize();

	.top-title {
		width: 1500px;
		margin: 0 auto;
		padding-top: 75px;
		padding-left: 110px;
		text-align: center;
		font-size: 56px;
		color: #1b3783;
		font-weight: 600;
		text-shadow: 0px 3px 3px rgba(0,0,0,0.4);
	}

	.top-info {
		@include displayFlex(center, flex-start);
		width: 1500px;
		height: 120px;
		margin: 15px auto 0 auto;
		box-sizing: border-box;
		padding:0 60px; 
		.level {
			width: 100px;
			text-align: center;
			font-size: 64px;
			color: #fff;
			font-weight: 600;
		}
		.part-day { 
			margin-left: 28px;
			font-size: 48px;
			color: #fff;
			font-weight: 600;
			width: 650px;
		}
		.date { 
			position: relative;
			margin-left: 20px;
			width: 300px;
			text-align: center;
			font-size: 32px;
			color: #b8c5c8;
			font-weight: 500;
		}
		.time {
			position: relative;
			margin-left: 75px;
			font-size: 40px;
			color: #fff;
			font-weight: 600;
		}
		.date-bg {
			position: absolute;
			left: 1052px;
    		top: 175px;
			width: 600px;
			height: 80px;
			background: url('~@/assets/images/study/date_bg.png') no-repeat;
		}
	}

	.alarm-chk {
		position: absolute;
		cursor: pointer;
		margin-left: 10px;
		font-size: 20px;
		font-weight: 500;
		input {
			opacity: 0;
			width: 27px;
			height: 27px;
			vertical-align: middle;
		}
		span {
			position: absolute;
			left:0;
			top:1px;
			width: 27px;
			height: 27px;
			display: inline-block;
			background: url('~@/assets/images/home/alarm_chk.png') no-repeat;
		}
		input:checked + span {
			background-position-y: -27px;
		}
	}
	
	.pre-wait {
		@include fullSize();
		background: url('~@/assets/images/study/study_wait_bg.png') no-repeat;

		.book-con {
			@include displayFlex;
			flex-direction: column;
			position: absolute;
			left: 270px;
			top: 335px;
			width: 447px;
			height: 600px;
			background-color: #fff;
			border-radius: 30px;
			.cover {
				width: 280px;
				height: 350px;
				border-radius: 16px;
				overflow: hidden;
				> img {
					width: 100%;
					height: 100%;
				}
			}
			.title {
				margin-top: 30px;
				font-size: 28px;
				font-weight: 500;
				text-align: center;
				box-sizing: border-box;
				padding: 0 10px;
			}
			.topic {
				margin-top: 15px;
				font-size: 40px;
				font-weight: 600;
				text-align: center;
				box-sizing: border-box;
				padding: 0 10px;
			}
		}

		.alarm-con {
			@include displayFlex;
			position: absolute;
			left: 735px;
			top: 335px;
			width: 914px;
			height: 600px;
			background-color: #fff;
			border-radius: 30px;
			.alarm-chk {
				right: 60px;
				bottom: 60px;
			}
		}
	}

	.pre-start {
		@include fullSize();
		background: url('~@/assets/images/study/study_wait_bg.png') no-repeat;
		
		.start-con {
			@include displayFlex;
			flex-direction: column;
			position: absolute;
			left: 270px;
			top: 335px;
			width: 1380px;
			height: 600px;
			background-color: #fff;
			border-radius: 30px;
			.title {
				font-family: 'nqr';
				font-size: 56px;
				font-weight: 600;
				color: #1b3783;
				line-height: 80px;
				> span {
					color: #fa324d;
					font-family: 'nqr';
					font-size: 56px;
					font-weight: 600;
				}
			}
			.time {
				width: 380px;
				height: 112px;
				border: solid 4px #d6d6d6;
				background-color: #f1f1f1;
				text-align: center;
				border-radius: 24px;
				line-height: 110px;
				color: #fa324d;
				font-family: 'nqr';
				font-size: 80px;
				font-weight: 600;
				margin-top: 40px;
				> span {
					color: #aaa;
					font-family: 'nqr';
					font-size: 64px;
					font-weight: 600;
					vertical-align: top;
    				margin-left: 15px;
				}
			}

			.pre-start-btn {
				width: 339px;
				height: 72px;
				border-radius: 36px;
				color: #fff;
				background-color: #00bfe6;
				font-family: 'nqr';
				font-size: 32px;
				font-weight: 600;
				box-shadow: 0px 4px 4px rgba(0,0,0,0.1);
				margin-top: 50px;
			}
		}
		
	}

	.after-wait {
		@include fullSize();
		background: url('~@/assets/images/study/study_wait_bg.png') no-repeat;
		.after-con {
			position: absolute;
			left: 270px;
			top: 335px;
			width: 1380px;
			height: 600px;
			background-color: #fff;
			border-radius: 30px;
			box-sizing: border-box;
			padding: 45px 0 0 120px;
			.now-con {
				@include displayFlex;
				position: absolute;
				left: 701px;
				top: 40px;
				width: 563px;
				height: 80px;
				background: url('~@/assets/images/study/after_date_bg.png') no-repeat;
				padding-left: 80px;
				.date {
					font-family: 'nqr';
					font-size: 32px;
					font-weight: 600;
					color: #3d7384;
				}
				.time {
					font-family: 'nqr';
					font-size: 40px;
					font-weight: 600;
					color: #3d7384;
					margin-left: 20px;
					> span {
						font-family: 'nqr';
						font-size: 32px;
						font-weight: 600;
						color: #3d7384;
						vertical-align: middle;
						margin-left: 10px;
					}
				}
			}
			.start-date {
				position: absolute;
				left: 720px;
				top: 210px;
				.date {
					position: relative; 
					left: 30px;
					font-family: 'nqr';
					font-size: 32px;
					font-weight: 600;
					color: #aaa;
				}
				.time {
					margin-top: 15px;
					font-family: 'nqr';
					font-size: 80px;
					font-weight: 600;
					color: #fa324d;
					> span {
						font-family: 'nqr';
						font-size: 30px;
						font-weight: 600;
						color: #222;
						vertical-align: middle;
						margin-left: 20px;
						position: relative;
						top: 10px;
					}
				}
			}
			.after-start-btn {
				position: absolute;
				left: 824px;
  				top: 374px;
				width: 360px;
				height: 72px;
				border-radius: 36px;
				color: #fff;
				background-color: #00bfe6;
				font-family: 'nqr';
				font-size: 32px;
				font-weight: 600;
				box-shadow: 0px 4px 4px rgba(0,0,0,0.1);
			}
			.alarm-chk {
				left: 580px;
				top: 490px;
			}
		}
	}

	
	
}
</style>