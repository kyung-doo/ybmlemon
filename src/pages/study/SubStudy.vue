<template>
	<div id="sub-class">

		<div class="content-wrap">
			<iframe v-if="isReady" v-show="studyLoaded" ref="studyContent" id="studyContent" :src="$config.subStudyFrameURL" width="100%" height="100%" scrolling="no"></iframe>
		</div>
		
		<div v-if="studyType === 'PreStudy' && !fullscreenVideo" class="pre-count">
			{{preCountTime}}
		</div>

		<!-- loading-con -->
		<transition name="fade">
			<div class="loading-con" v-show="!studyLoaded">
				<div>
					<img src="~@/assets/images/common/loading.gif" /><br />
					수업을 시작하고 있습니다.<br />잠시만 기다려 주세요.
				</div>
			</div>
		</transition>
		<!-- //loading-con -->
		
		<div v-if="studyType === 'HomeworkOn' && isReady">

			<div class="restudy-select" v-if="posHomeworkOn.indexOf('passed') > -1 || (posHomeworkOn === '' && restudyHomeworkOn.length > 0)">
				<ui-button class="select-btn"
					@button:click="() => showRestudySelect = !showRestudySelect">
					{{getPartTitle( restudyHomeworkOn[selectRestudy] )}}
				</ui-button>
				<transition name="fade">
					<ui-tab-menu
						class="select-list"
						v-show="showRestudySelect" 
						:active-index="1" 
						@tabmenu:change="onChangeRestudy">
						<ui-button v-for="(list, index) in restudyHomeworkOn" 
							:key="index">
							{{getPartTitle(list)}}
						</ui-button>
					</ui-tab-menu>
				</transition>
			</div>

			<!-- study-header -->
			<study-header 
				v-if="homeworkBookInfo && homeworkOnCode && !fullscreenVideo"
				:level="$ucodeToLevel(homeworkOnCode)" 
				:part="$ucodeToPart(homeworkOnCode)"
				:day="$ucodeToDay(homeworkOnCode)" 
				:Bcode="homeworkBookInfo.Bcode"
				:Bno="homeworkBookInfo.Bno"
				:Lno="homeworkBookInfo.Lno"
				:Btitle="homeworkBookInfo.book_title">
			</study-header>
			<!-- //study-header -->
			<home-button />
			<exit-button />
		</div>
		
	</div>
</template>

<script>

import StudyHeader from '@/components/study/StudyHeader'

export default {
    
	name: 'subStudy',

	components: {
		StudyHeader
	},

	data () {
		return {
			isReady: false,
			studyLoaded: false,
			studyWindow: null,
			studyType : this.$route.name,
			preCountTime: '',
			homeworkBookInfo: null,
			fullscreenVideo: false,
			selectRestudy: 0,
			hmwkOnCode: '',
			showRestudySelect: false
		}
	},

	computed: {
		classCode () {
			switch( this.studyType ) {
				case 'PreStudy' : return this.$ucodeToPart(this.studyInfo.ucode) + '-pre'
				case 'AfterStudy' : return this.$ucodeToPart(this.studyInfo.ucode) + '-after'
				case 'HomeworkOn' : return 'Hmwk-on'
			}
		},

		restudyHomeworkOn () {
			return this.$store.getters['myself/getHomeworkOnRestudys']
		},

		posHomeworkOn () {
			return this.$store.getters['myself/getPosHomeworkOn']
		},

		homeworkOnPcd () {
			return this.$store.getters['myself/getHomeworkOnPcd']
		},

		homeworkOnCode: {
			get: function () {
				if(!this.hmwkOnCode) {
					return this.$store.getters['myself/getHomeworkOnUcode']
				}
				return this.hmwkOnCode
			},
			set: function ( value ){
				this.hmwkOnCode = value
			}
		}
	},

	watch: {
		studyStatus ( newVal ) {
			if(this.studyType === 'PreStudy' && newVal === 'onStudy') {
				this.studyWindow.onreceiveviewermessage({name: 'pre-finish'});
			}
		}
	},

	async mounted () {
		// 학생이 아니면 error처리
		if(!this.userInfo.id || this.userInfo.type !== 'ST'){
			this.$router.push({name: 'Error'})
			return
		}
		let result
		if( this.studyType === 'HomeworkOn' && !this.homeworkOnCode) {
			result = await this.$http.post(`${this.$config.LMSApiURL}/getHmwkMain`, { 
				pcd_seq: this.userInfo.pcd_seq,
				mem_id: this.userInfo.id 
			})
			await this.$store.dispatch('myself/setPosHomeworkOn', result.data['latest_hmwk_on'])
			await this.$store.dispatch('myself/setHomeworkOnPcd', result.data['hmwk_on_pcd_seq'])
			await this.$store.dispatch('myself/setHomeworkOnRestudys', result.data['review_hmwk_on'])
		}

		if(!this.posHomeworkOn && this.restudyHomeworkOn.length > 0) {
			this.homeworkOnCode = this.restudyHomeworkOn[0]
			result = await this.$http.get(`${this.$config.CMSApiURL}/getBookMeta.php?Ucode=${this.restudyHomeworkOn[0]}`)
			this.homeworkBookInfo = result.data
		} else {
			result = await this.$http.get(`${this.$config.CMSApiURL}/getBookMeta.php?Ucode=${this.homeworkOnCode}`)
			this.homeworkBookInfo = result.data
		}

		this.isReady = true

		this.$eventBus
			.$on('studyframe:reciveMessage', this.onStudyFrameMessage)
			.$on('timeupdate', this.onTimeupdate)
			.$on('fullscreen-video', ( flag )=> {
				this.fullscreenVideo = flag
			})

		this.onTimeupdate(this.$eventBus.now)
	},

	beforeDestroy () {
		this.$eventBus
			.$off('studyframe:reciveMessage', this.onStudyFrameMessage)
			.$off('timeupdate', this.onTimeupdate)
			.$off('fullscreen-video')
		this.$refs.studyContent.src= ''
	},

	methods: {

		onStudyFrameMessage ( message ) {
			switch( message ) {
				case 'module-ready' :
					this.studyWindow = this.$refs.studyContent.contentWindow
					this.studyWindow.USER_INFO = { ...this.userInfo }
					let restudy = this.studyType === 'HomeworkOn' && this.posHomeworkOn.indexOf('passed') > 1 ? true : false
					if(!this.posHomeworkOn && this.restudyHomeworkOn.length > 0) {
						restudy = true
					}
					console.log('restudy : ', restudy)
					this.studyWindow.onreceiveviewermessage({
							name: 'init-modlue-sub', 
							value: { 
								Ucode: this.studyType === 'HomeworkOn' ? this.homeworkOnCode : this.studyInfo.ucode,
								cls_code: this.classCode,
								pcd_seq: this.studyType === 'HomeworkOn' ? this.homeworkOnPcd : this.userInfo.pcd_seq,
								restudy: restudy,
								ot: this.studyInfo.otday
							}
						})
				break
				case 'module-loaded' :
					this.studyLoaded = true
				break
			}
		},

		getPartTitle ( ucode ) {
			const level = this.$ucodeToLevel( ucode )
			const part = this.$ucodeToPart( ucode )
			const day = this.$ucodeToDay( ucode )
			const bcode = LM.returnBookCode(level, part, day).replace('_', ' ')
			return `${level}${part}-Day${day} ${bcode}`
		},

		async onChangeRestudy ( idx ) {
			if(idx-1 != this.selectRestudy) {
				this.selectRestudy = idx -1
				this.homeworkOnCode = this.restudyHomeworkOn[idx -1]
				this.studyLoaded = false
				this.showRestudySelect = false

				const result = await this.$http.get(`${this.$config.CMSApiURL}/getBookMeta.php?Ucode=${this.homeworkOnCode}`)
				this.homeworkBookInfo = result.data

				this.studyWindow.onreceiveviewermessage( {
					name: 'init-modlue-sub', 
					value: { 
						Ucode: this.homeworkOnCode,
						cls_code: this.classCode,
						pcd_seq: this.homeworkOnPcd,
						restudy: true
					}
				})
			}
		},

		onTimeupdate ( now ) {
			if(this.studyStatus === 'onPre') {
				let preCount = (5 * 60 * 1000) - (now - this.studyInfo.preStartTime)
				if(!preCount) preCount = 5 * 60 * 1000
				if(preCount < 0) preCount = 0
				const minut = this.$addZero(parseInt(preCount/60/1000), 2)
				const second = this.$addZero(parseInt(preCount/1000)%60, 2)
				this.preCountTime = `${minut} : ${second}`
			}
		}
	}
}
</script>

<style lang="scss">

#sub-class{
	position: relative;
	@include fullSize();
	.content-wrap {
		width: 100%;
		height: 100%;
	}
	.pre-count{
		position: absolute;
		top: 27px;
    	right: 105px;
		font-size: 36px;
		font-weight: 600;
		color: #fff;
		width: 187px;
		height: 59px;
		box-sizing: border-box;
		padding: 11px 0 11px 52px;
		background: url('~@/assets/images/study/pre_time_bg.png') no-repeat;
	}
	.loading-con {
		position: absolute;
		left: 0;
		top: 190px;
		width: 100%;
		height: 873px;
		@include displayFlex;
		> div {
			font-size: 40px;
			font-weight: 600;
			text-align: center;
		}
	}
	.restudy-select {
		position: absolute;
		right: 192px;
    	top: 25px;
		.select-btn {
			width: 260px;
			height: 60px;
			font-family: 'nqr';
			font-size: 25px;
			font-weight: 600;
			color: #808080;
			background-color: #fff;
			border-radius: 30px;
			box-shadow: 2px 4px 3px rgba(0,0,0,0.1);
		}
		.select-list {
			position: absolute;
			left: 0;
			top: 65px;
			width: 260px;
			border-radius: 30px;
			overflow: hidden;
			background-color: #fff;
			box-shadow: 2px 4px 3px rgba(0,0,0,0.1);
			.btn {
				width: 260px;
				height: 60px;
				font-family: 'nqr';
				font-size: 25px;
				font-weight: 600;
				color: #808080;
				transition: all 0.4s;
				&:hover,
				&.down {
					color: #222;
				}
				&.active {
					background-color: #86bae2;
				}
			}
		}
	}
}
.L1 #sub-class,
.L2 #sub-class {
	background: url('~@/assets/images/study/sub_class_bg1.png') no-repeat;
}
.L3 #sub-class,
.L4 #sub-class {
	background: url('~@/assets/images/study/sub_class_bg2.png') no-repeat;
}
.L5 #sub-class,
.L6 #sub-class,
.L7 #sub-class {
	background: url('~@/assets/images/study/sub_class_bg3.png') no-repeat;
}

</style>