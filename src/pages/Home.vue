<template>
	<div id="home" v-if="isLoded">
		
		<!-- user-info -->
		<div class="user-info">
			<div class="name">{{userInfo.name}}</div>
			<div class="points">{{pointInfo.totalPoints}}</div>
		</div>
		<!-- //user-info -->

		<!-- deco -->
		<div class="deco"></div>
		<!-- //deco -->

		<!-- top-title -->
		<div class="top-title">자기주도학습방</div>
		<!-- //top-title -->

		<!-- menu-wrap -->
		<div class="menu-wrap" ref="menuWrap">
			<div class="row">
				<ui-button type="a" @button:click="() => $router.push({name: 'MyselfStudyTable'})">
					<div class="image"><img src="~@/assets/images/home/menu_img_1.png" /></div>
					<div class="text">자기주도학습표</div>
				</ui-button>
				<ui-button type="a" @button:click="onClickHomeworkOn">
					<div class="image"><img src="~@/assets/images/home/menu_img_2.png" /></div>
					<div class="text">
						온라인 숙제
						<span class="hmwk-on-status">{{homeworkStatus}}</span>
					</div>
				</ui-button>
				<ui-button :class="parseInt(homeworkPicLatestUp) === 1 ? 'on':''" type="a" @button:click="() => $router.push({name: 'MyselfHomeworkPicture', query: { type: 'week', page: 1} })">
					<div class="image"><img src="~@/assets/images/home/menu_img_3.png" /></div>
					<div class="text">숙제 사진 제출</div>
				</ui-button>
				<ui-button type="a" @button:click="() => $router.push({name: 'MyselfHomeworkNote', query: { orderby: 'date', part: '', level: '', page: 1 }})">
					<div class="image"><img src="~@/assets/images/home/menu_img_4.png" /></div>
					<div class="text">온라인 노트</div>
				</ui-button>
			</div>
			<div class="row">
				<ui-button type="a" @button:click="goReadingfarm">
					<div class="image"><img src="~@/assets/images/home/menu_img_5.png" /></div>
					<div class="text">리딩팜 읽기</div>
				</ui-button>
				<ui-button type="a" @button:click="() => $router.push({name: 'MyselfQNA', query: { page: 1 }})">
					<div class="image"><img src="~@/assets/images/home/menu_img_6.png" /></div>
					<div class="text">학습 Q&A</div>
				</ui-button>
				<ui-button type="a" @button:click="() => $router.push({name: 'MyGallery'})">
					<div class="image"><img src="~@/assets/images/home/menu_img_7.png" /></div>
					<div class="text">프로젝트 결과물</div>
				</ui-button>
				<ui-button type="a" @button:click="() => $router.push({name: 'MyselfDownload', query: {orderby: 'book', part:'R', page: 1}})">
					<div class="image"><img src="~@/assets/images/home/menu_img_8.png" /></div>
					<div class="text">자료실</div>
				</ui-button>
			</div>
		</div>
		<!-- //menu-wrap -->

		<!-- bottom-wrap -->
		<div class="bottom-wrap">
			<div v-if="studyStatus ==='off' && !isLast">
				<div class="title">
					<strong>{{userInfo.name}}</strong> 님의 다음 {{$ucodeToPartFullname(studyInfo.ucode)}} 수업은 <strong>{{$dateformat(studyInfo.preStartTime, 'mm')}}</strong>월 <strong>{{$dateformat(studyInfo.preStartTime, 'dd')}}</strong>일 <strong>{{$dateformat(studyInfo.preStartTime, 'HH')}}</strong>시 <strong>{{$dateformat(studyInfo.preStartTime, 'MM')}}</strong>분 입니다.
				</div>
				<div class="day">{{$ucodeToPartFullname(studyInfo.ucode)}}-Day<span>{{$ucodeToDay(studyInfo.ucode)}}</span></div>
				<div class="d-day">D-day<span>{{$addZero(dDay, 2)}}</span></div>
				<label class="alarm">
					<input type="checkbox" v-model="chkAlarm">
					<span></span>
					Alarm
				</label>
			</div>
			<div v-if="studyStatus !=='off' && !isLast">
				<div class="title">
					<strong>{{userInfo.name}}</strong> 님의 {{$ucodeToPartFullname(studyInfo.ucode)}} 수업이 시작되었습니다.
				</div>
				<div class="day">
					{{$ucodeToPartFullname(studyInfo.ucode)}}-Day<span>{{$ucodeToDay(studyInfo.ucode)}}</span>
				</div>
				<ui-button class="study-btn" @button:click="() => $router.push({name: 'Study'})">입장하기</ui-button>
				<label class="alarm">
					<input type="checkbox" v-model="chkAlarm">
					<span></span>
					Alarm
				</label>
			</div>
			<div v-if="isLast">
				<div class="title">
					<strong>{{userInfo.name}}</strong> 님은 모든 수업을 완료하였습니다.
				</div>
			</div>
		</div>
		<!-- //bottom-wrap -->

		<ui-button class="study_guide_btn" @button:click="goClassError">
			<img src="~@/assets/images/home/study_guide_btn.png" />
		</ui-button>

		<exit-button />

	</div>
</template>

<script>

import AudioControl from '@/libs/audioControl'
import { gsap, Cubic, Expo } from 'gsap'
import _ from 'lodash'


export default {
	name: 'Home',

	data () {
		return {
			dDay: '',
			dHour: '00',
			dMin: '00',
			dSec: '00',
			nowTime: '',
			chkAlarm: this.$store.getters['getAlarm'],
			alarmAudio: new AudioControl('alarm.mp3'),
			startAlarmAudio1: new AudioControl('alram_satart_1.mp3'),
			startAlarmAudio2: new AudioControl('alram_satart_2.mp3'),
			isLoded: false,
			isLast: false,
			timer: null
		}
	},

	watch: {
		chkAlarm ( newVal ) {
			this.alarm = newVal
			this.$store.dispatch('setAlarm', newVal)
		},

		studyStatus () {
			if(this.studyStatus === 'off') {
				location.href = this.$baseUrl
			}
		}
	},

	computed: {

		posHomeworkOn() {
			return this.$store.getters['myself/getPosHomeworkOn']
		},

		homeworkStatus () {
			if(!this.posHomeworkOn) {
				return '미출제'
			} else {
				if(this.posHomeworkOn.indexOf('passed') > -1) {
					return '학습완료'
				} else if(this.posHomeworkOn.split('_').length === 2) {
					return '미학습'
				} else {
					return '학습중'
				}
			}
		},

		restudyHomeworkOn () {
			return this.$store.getters['myself/getHomeworkOnRestudys']
		},

		homeworkPicLatestUp() {
			return this.$store.getters['myself/getLatestUp']
		},


		homeworkLevel () {
			return this.posHomeworkOn.split('_')[0]
		},

		homeworkLevelTitle () {
			return this.homeworkLevel.replace('L', 'Level ')
		},

		homeworkDayTitle () {
			const dayCode = this.posHomeworkOn.split('_')[1]
			if(dayCode) {
				if(dayCode.slice(0, 1) === "R") {
					return '<span>Reading</span>-Day' + ' '+ dayCode.slice(1)
				} else {
					return '<span>Speaking</span>-Day' + ' '+ dayCode.slice(1)
				} 
			}
			return ''
		},

		studyLevelTitle () {
			return 'Level' + this.$ucodeToLevel(this.studyInfo.ucode)
		},

		studyDayTitle () {
			return `<span>${this.$ucodeToPartFullname(this.studyInfo.ucode)}</span>-Day ${this.$ucodeToDay(this.studyInfo.ucode)}`
		},

		todayStudy () {
			return this.dDay === '' ?  '' : this.dDay === 0 ? 'on' : 'off' 
		}

	},


	async mounted () {

		// 학생이 아니면 error처리
		if(!this.userInfo.id || this.userInfo.type !== 'ST'){
			this.$router.push({name: 'Error'})
			return
		}
		

		let result = await this.$http.post(`${this.$config.LMSApiURL}/getStartViewer`, { 
			pcd_seq: this.userInfo.pcd_seq
		})

		if(result.data.is_last && parseInt(result.data.is_last) === 1) {
			this.isLast = true
		}

		if(result.data.new_pcd_seq) {
			const viewerInfo = JSON.parse(window.sessionStorage.getItem('viewerInfo'))
			const newViewerInfo = Object.assign(viewerInfo, {pcd_seq : result.data.new_pcd_seq})
			window.sessionStorage.setItem('viewerInfo', JSON.stringify(newViewerInfo))
			this.$store.dispatch('setUserInfo', {
				pcd_seq: result.data.new_pcd_seq
			})
		}
		
		if(!this.isLast) {
			if(this.$config.studyInfoType === 'api') {
				this.$eventBus.$emit('setStudyInfo', result.data['start_classtime'], result.data['start_classUcode'])
			}

			if(this.userInfo.type === 'ST') {
				this.$store.dispatch('setStudyInfo', { prePassed: result.data['pre_passed'], mainPassed: result.data['main_passed']})
			}
		}

		if(result.data['ybmfarm']) {
			this.studyInfo.ybmfarm = result.data['ybmfarm'];
		}
		

		result = await this.$http.post(`${this.$config.LMSApiURL}/getHmwkMain`, { 
			pcd_seq: this.userInfo.pcd_seq,
			mem_id: this.userInfo.id 
		})
		
		this.$store.dispatch('myself/setLatestUp', result.data['latest_up'])
		this.$store.dispatch('myself/setPosHomeworkOn', result.data['latest_hmwk_on'])
		this.$store.dispatch('myself/setHomeworkOnPcd', result.data['hmwk_on_pcd_seq'])
		this.$store.dispatch('myself/setHomeworkOffInfo', result.data['RS_hmwk_off'])
		this.$store.dispatch('myself/setHomeworkSdlInfo', {R: result.data['sdl_pcdR'], S: result.data['sdl_pcdS']})
		this.$store.dispatch('myself/setHomeworkOnRestudys', result.data['review_hmwk_on'])


		result = await this.$http.post(`${this.$config.LMSApiURL}/getTotalPoints`, { 
			pcd_seq: this.userInfo.pcd_seq,
			Ucode: this.studyInfo.ucode,
			mem_id: this.userInfo.id
		})

		this.$store.dispatch('setPointInfo', { 
			totalPoints: result.data['total_point'] ? parseInt(result.data['total_point']) : 0,
			preMonthPoints: result.data['prev_pointsM'] ? parseInt(result.data['prev_pointsM']) : 0,
			nowMonthPoints: result.data['now_pointsM'] ? parseInt(result.data['now_pointsM']) : 0,
			currntPoints: result.data['total_pointsU'] ? parseInt(result.data['total_pointsU']) : 0,
			prePoint: result.data['pre_pointU'] ? parseInt(result.data['pre_pointU']) : 0,
			mainPoint: result.data['main_pointU'] ? parseInt(result.data['main_pointU']) : 0,
			mainPointK: result.data['main_pointK'] ? parseInt(result.data['main_pointK']) : 0,
			mainPointF: result.data['main_pointF'] ? parseInt(result.data['main_pointF']) : 0,
			afterPoint: result.data['after_pointU'] ? parseInt(result.data['after_pointU']) : 0,
			homeworkOnPoint: result.data['HWon_pointU'] ? parseInt(result.data['HWon_pointU']) : 0,
			homeworkOffPoint: result.data['HWoff_pointU'] ? parseInt(result.data['HWoff_pointU']) : 0,
			prevMonthRank: result.data['prev_M_rank'] ? parseInt(result.data['prev_M_rank']) : 0
		})

		if(!this.isLast) {
			this.$eventBus.$on('timeupdate', this.onTimeupdate)
			this.onTimeupdate(this.$eventBus.now)
		}

		this.isLoded = true
	},

	beforeDestroy () {
		this.alarmAudio.destroy()
		this.startAlarmAudio1.destroy()
		this.startAlarmAudio2.destroy()
		clearTimeout(this.timer);
		this.$eventBus.$off('timeupdate', this.onTimeupdate)
	},

	methods: {
		onClickHomeworkOn () {
			if(this.posHomeworkOn || this.restudyHomeworkOn.length > 0) {
				this.$router.push({name: 'HomeworkOn'})
			} else {
				this.$confirm({
					message: '출제된 온라인 숙제가 없습니다.',
					button: [
						{ name: '확인' } 
					]
				})
			}
		},

		goReadingfarm () {
			if (this.studyInfo.ybmfarm) {
				window.open("about:blank").location.href = "https://www.ybmfarm.com/service/sso/procSso?data=" + this.studyInfo.ybmfarm;
			} else {
				this.$confirm({
					message: '관리자에게 문의해 주세요.',
					button: [
						{ name: '확인' }
					]
				});
			}  
		},

		goClassError() {
			window.open('https://ybmlemon.com/customer/classError')
		},

		onTimeupdate ( now ) {
			const endDay = new Date(this.$dateformat(this.studyInfo.preStartTime, 'yyyy/mm/dd') + ' '+ '00:00:00')
			const nowDay = new Date(this.$dateformat(now, 'yyyy/mm/dd') + ' '+ '00:00:00')
			let gap = nowDay - endDay
			this.dDay = Math.ceil(gap / (1000 * 60 * 60 * 24)) * -1

			gap = now.getTime() - this.studyInfo.preStartTime.getTime()
			var hour = String(Math.ceil((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) * -1)
			var min = String(Math.ceil((gap % (1000 * 60 * 60)) / (1000 * 60)) * -1)
			var sec = String(Math.ceil((gap % (1000 * 60)) / 1000) * -1)
			
			if(parseInt(hour) < 10) hour = '0'+hour
			if(parseInt(min) < 10) min = '0'+min
			if(parseInt(sec) < 10) sec = '0'+sec

			if(gap >= 0) {
				this.dHour = '00'
				this.dMin = '00'
				this.dSec = '00'
			} else {
				this.dHour = hour
				this.dMin = min
				this.dSec = sec
				const count = parseInt(Math.abs(gap/1000));
				if(this.chkAlarm === true) {
					if(count === 300) {
						this.alarmAudio.play()
						this.timer = setTimeout(()=>{
							this.startAlarmAudio1.play()
						}, 4000);
					}
					if(count === 120) {
						this.alarmAudio.play()
						this.timer = setTimeout(()=>{
							this.startAlarmAudio2.play()
						}, 4000);
					}
					if([30, 5].indexOf( count ) > -1) {
						this.alarmAudio.play()
					}
				}
			}
			this.nowTime = this.$dateformat(now, 'TT hh : MM : ss')
			// console.log('D-DAY :: ', this.studyStatus, gap, this.dDay, this.dHour, this.dMin, this.dSec)
		}
	}
}
</script>

<style lang="scss">
#home {
	position: relative;
	@include fullSize();

	.user-info {
		position: absolute;
		left: 1464px;
		top: 37px;
		width: 347px;
		height: 64px;
		background: url('~@/assets/images/home/user_info_bg.png') no-repeat;
		padding-left: 60px;
		@include displayFlex(center, flex-start);
		.name {
			font-size: 29px;
			font-weight: 500;
			color: #4d4d4d;
			width: 115px;
		}
		.points {
			font-size: 29px;
			font-weight: 500;
			color: #fff;
			width: 92px;
			text-align: center;
			margin-left: 48px;
		}
	}

	.top-title {
		padding-top: 105px;
		font-size: 36px;
		font-weight: 600;
		color: #5466b8;
		text-align: center;
	}

	.menu-wrap {
		.row {
			margin-top: 45px;
			@include displayFlex;
		}
		.btn {
			position: relative;
			display: block;
			width: 319px;
			height: 320px;
			overflow: hidden;
			background-color: #fff;
			border-radius: 30px;
			margin: 0 22px;
			box-shadow: 2px 3px 15px rgb(157, 213, 222);
			transition: all 0.6s $expo-ease-out;
			will-change: transform;
			.text {
				position: absolute;
				left: 0;
				bottom: 30px;
				text-align: center;
				width: 100%;
				font-size: 24px;
				font-weight: 400px;
			}
			.hmwk-on-status {
				position: relative;
				top: 7px;
				display: inline-block;
				width: 97px;
				height:44px;
				background: url('~@/assets/images/home/hmwk_on_status.png') no-repeat;
				vertical-align: bottom;
				line-height: 44px;
				font-size: 21px;
				color: #fff;
				margin-left: 5px;
			}
			&.on:before {
				content: '';
				position: absolute;
				top:15px;
				right: 15px;
				display: inline-block;
				width: 51px;
				height: 52px;
				background: url('~@/assets/images/home/latest_bullet.png') no-repeat;
			}

			&:hover,
			&.down {
				transform: scale(1.03);
				box-shadow: 3px 5px 20px rgb(84, 144, 153);
			}
		}
	}

	.deco {
		position: absolute;
		left: -65px;
    	bottom: -27px;
		width: 410px;
		height: 384px;
		background: url('~@/assets/images/home/deco.png') no-repeat;
		pointer-events: none;
	}

	.bottom-wrap {
		margin-top: 90px;
		text-align: center;
		> div {
			@include displayFlex;
		}
		.title {
			font-size: 21px;
			> strong {
				font-weight: 500;
				font-size: 32px;
				vertical-align: middle;
			}
		}
		.day {
			margin-left: 20px;
			font-size: 30px;
			font-weight: 500;
			&:before {
				content: '';
				display: inline-block;
				width: 29px;
				height: 29px;
				background: url('~@/assets/images/home/day_bullet.png') no-repeat;
				vertical-align: middle;
			}
			> span {
				color: #fff;
				font-size: 26px;
				font-weight: 300;
				padding: 3px 8px 2px 8px;
				background-color: #666;
				margin-left: 5px;
				border-radius: 3px;
			}
		}

		.study-btn {
			width: 152px;
			height: 49px;
			background: url('~@/assets/images/home/study_btn.png') no-repeat;
			margin-left: 15px;
			padding-left: 25px;
			color: #fff;
			box-sizing: border-box;
			font-size: 21px;
			font-weight: 400;	
		}

		.d-day {
			@include displayFlex;
			width: 146px;
			height: 55px;
			background: url('~@/assets/images/home/d_day_bg.png') no-repeat;
			margin-left: 10px;
			font-size: 22px;
			font-weight: 400;
			> span {
				font-size: 26px;
				width: 38px;
				display: inline-block;
				margin-left: 10px;
				font-weight: 500;
			}
		}
		.alarm {
			position: relative;
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
	}

	.study_guide_btn {
		position: absolute;
		right: 50px;
		bottom: 50px;
	}
	
	
	.exit-btn {
		top: 35px !important;
	}
}
</style>