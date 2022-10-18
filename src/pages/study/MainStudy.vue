<template>
    <div id="main-class">
        
		<!-- viewer-container -->
		<div :class="['viewer-container', 
			whiteBoardStatuse === 'open' && currentOwner === userInfo.type ? 'white-board-open' : '', 
			zoomMode.enabled ? 'zoom-mode' : '',
			zoomMode.enabled && zoomMode.hideLeftBar ? 'hide-left-bar' : '',
			zoomMode.enabled && zoomMode.previewStudy ? 'preview-study' : '']">

			<!-- viewer-header -->
			<div class="viewer-header">
				
				<div v-show="studyLoaded" 
					:class="['btn-con', zoomMode.enabled ? 'disable':'']" >

					<ui-button 
						v-if="currentOwner === userInfo.type" 
						title="타이머"
						class="round-btn timer-btn" 
						@button:click="() => this.showTimerPopup = true">
						<img src="~@/assets/images/study/timer_icon.png" />
					</ui-button>

					<div class="btn-group" v-if="currentOwner === userInfo.type">
						<ui-button 
							:class="['on-btn', STPermissions.buzzer ? 'active' : '']"
							:title="STPermissions.buzzer ? '학생 부저 권한 끄기' : '학생 부저 권한 켜기'"
							@button:click="onSTPermission('buzzer')">
							ON
						</ui-button>
						<ui-button 
							title="부저"
							class="round-btn buzzer-btn" 
							@button:click="onStartBuzzer">
							<img src="~@/assets/images/study/buzzer_icon.png" />
						</ui-button>
					</div>

					<ui-button 
						v-if="userInfo.type === 'ST' && STPermissions.buzzer" 
						title="부저"
						class="round-btn buzzer-btn" 
						@button:click="onStartBuzzer">
						<img src="~@/assets/images/study/buzzer_icon.png" />
					</ui-button>

					<div class="btn-group" v-if="currentOwner === userInfo.type">
						<ui-button 
							:class="['on-btn', STPermissions.dice ? 'active' : '']"
							:title="STPermissions.dice ? '학생 주사위 권한 끄기' : '학생 주사위 권한 켜기'"
							@button:click="onSTPermission('dice')">
							ON
						</ui-button>
						<ui-button 
							title="주사위"
							class="round-btn dice-own-btn" 
							@button:click="onStartDice('single')">
							<img src="~@/assets/images/study/dice_own_icon.png" />
						</ui-button>
					</div>

					<ui-button 
						v-if="currentOwner === userInfo.type"
						type="div"
						title="주사위"
						:class="['round-btn', 'dice-two-btn', showDiceCount > 0 ? 'active' : '']" 
						@button:click="onStartDice('double')">
						<img src="~@/assets/images/study/dice_double_icon.png" />
						<div v-show="showDiceCount > 0" class="btn-progress" style="width: 66px;">
							<span ref="diceProgressBar" class="bar"></span>
						</div>
					</ui-button>

					<ui-button 
						v-if="userInfo.type === 'ST' && STPermissions.dice" 
						title="주사위"
						class="round-btn dice-own-btn" 
						@button:click="onStartDice('single')">
						<img src="~@/assets/images/study/dice_own_icon.png" />
					</ui-button>

					<ui-button 
						type="div"
						v-if="userInfo.type === 'ST' && showDiceCount > 0" 
						title="주사위"
						:class="['round-btn', 'dice-two-btn', showDiceCount > 0 ? 'ani' : '']" 
						@button:click="onStartDice('double')">
						<img src="~@/assets/images/study/dice_double_icon.png" />
						<div v-show="showDiceCount > 0" class="btn-progress" style="width: 66px;">
							<span ref="diceProgressBar" class="bar"></span>
						</div>
					</ui-button>

					<div class="hand-btns" v-if="currentOwner === userInfo.type">
						<ui-button 
							title="가위"
							:class="['round-btn', 'hand-btn', showHandCount > 0 ? 'disable':'', handIndex === 1 ? 'active': '']"
							@button:click="onStartHandGame(1)">
							<img src="~@/assets/images/study/hand_icon1.png" />
						</ui-button>
						<ui-button 
							title="바위"
							:class="['round-btn', 'hand-btn', showHandCount > 0 ? 'disable':'', handIndex === 2 ? 'active': '']"
							@button:click="onStartHandGame(2)">
							<img src="~@/assets/images/study/hand_icon2.png" />
						</ui-button>
						<ui-button
							title="보"
							:class="['round-btn', 'hand-btn', showHandCount > 0 ? 'disable':'', handIndex === 3 ? 'active': '']"
							@button:click="onStartHandGame(3)">
							<img src="~@/assets/images/study/hand_icon3.png" />
						</ui-button>
						<div v-show="showHandCount > 0" class="btn-progress" style="width: 122px;">
							<span ref="handProgressBar" class="bar"></span>
						</div>
					</div>

					<div class="hand-btns" v-if="userInfo.type === 'ST' && showHandCount > 0">
						<ui-button 
							title="가위"
							:class="['round-btn', 'hand-btn', 'ani']"
							@button:click="onStartHandGame(1)">
							<img src="~@/assets/images/study/hand_icon1.png" />
						</ui-button>
						<ui-button 
							title="바위"
							:class="['round-btn', 'hand-btn', 'ani']"
							@button:click="onStartHandGame(2)">
							<img src="~@/assets/images/study/hand_icon2.png" />
						</ui-button>
						<ui-button 
							title="보"
							:class="['round-btn', 'hand-btn', 'ani']"
							@button:click="onStartHandGame(3)">
							<img src="~@/assets/images/study/hand_icon3.png" />
						</ui-button>
						<div v-show="showHandCount > 0" class="btn-progress" style="width: 122px;">
							<span ref="handProgressBar" class="bar"></span>
						</div>
					</div>
				</div>
			</div>
			<!-- //viewer-header -->

			<!-- viewer-wrap -->
			<div class="viewer-wrapper">
				<!-- viewer-left -->
				<div class="viewer-left">

					<!-- top-menu -->
					<div class="top-menu">

						<ui-button 
							v-if="userInfo.type !== 'OB'"
							class="config-btn" 
							title="설정"
							@button:click="onConfigShow">
						</ui-button>

						<mic-button v-if="userInfo.type !== 'OB'" :stream="userInfo.type" />

						<volume-button @change-volume="onChangeVolume" />

						<ui-button 
							v-if="userInfo.type === 'KT'" 
							:title="!isServerRec ? '서버녹화 시작' : '서버녹화 중지'"
							:class="['server-rec-btn', isServerRec ? 'active' : '']" 
							@button:click="onServerRecord">
						</ui-button>

						<ui-button 
							v-if="userInfo.type === 'KT'" 
							:title="currentOwner === 'KT' ? 'FT 권한 위임' : 'FT 권한 해제'"
							:class="['permission-btn', currentOwner === 'KT' ? '' : 'active']" 
							@button:click="onPermissionFT">
						</ui-button>
						
					</div>
					<!-- top-menu -->

					<!-- points-chatting -->
					<points-chatting 
						ref="pointsChatting"
						:charactor-num="charactorNum"
						@send-message="sendMessage" 
						@show-ranking="onShowRanking"
						@st-chatting-permission="onSTPermission('chatting')" />
					<!-- //points-chatting -->

				</div>
				<!-- //viewer-left -->
				
				<!-- viewer-right -->
				<div class="viewer-right">

					<!-- viewer-content -->
					<div class="viewer-content">
						
						<!-- content-wrap -->
						<div :class="['content-wrap', userInfo.type === currentOwner ? '' : (userInfo.type === 'ST' && STPermissions.activity) ? '' : 'disable' ]">
							<iframe 
								v-if="studyLoadStart"
								ref="studyContent" 
								:src="$config.mainStudyFrameURL" 
								width="100%" 
								height="100%" 
								scrolling="no">
							</iframe>
						</div>
						<!-- //content-wrap -->

						<!-- screen-share -->
						<div ref="screenShare" class="screen-share-con" v-show="screenStream">
							<video ref="screenShareVideo" autoplay playsinline></video>
						</div>
						<!-- //screen-share -->

						<!-- viewer-menu -->
						<div :class="['viewer-menu', isShowBlind ? 'disable' : '']">

							<div :class="['st-permission', zoomMode.enabled ? 'disable' : '']" 
								v-if="currentOwner === userInfo.type">
								<ui-button 
									:class="['st-activity-btn', STPermissions.activity ? 'active' : '']"
									:title="STPermissions.activity ? '학생 활동 권한 끄기' : '학생 활동 권한 켜기'"
									@button:click="onSTPermission('activity')">
								</ui-button>
								<ui-button 
									:class="['st-board-btn', STPermissions.board ? 'active' : '']"
									:title="STPermissions.board ? '학생 판서 권한 끄기' : '학생 판서 권한 켜기'"
									@button:click="onSTPermission('board')">
								</ui-button>
							</div>

							<div class="line" v-if="currentOwner === userInfo.type"></div>

							<ui-button 
								v-if="userInfo.type === 'KT'"
								:title="!this.isShareScreen ? '화면공유 시작' : '화면공유 중지'" 
								:class="['ico-btn', 'share-btn', this.isShareScreen ? 'active' : '', zoomMode.enabled ? 'disable' : '']"
								@button:click="onShareScreen">
							</ui-button>

							<div class="line" v-if="userInfo.type === 'KT'"></div>

							<ui-button 
								v-if="currentOwner === userInfo.type"  
								:title="!this.zoomMode.enabled ? '줌모드 켜기' : '줌모드 끄기'"
								:class="['ico-btn', 'zoom-btn', this.zoomMode.enabled ? 'active' : '']"
								@button:click="onZoomMode">
							</ui-button>

							<div class="line" v-if="currentOwner === userInfo.type"></div>

							<ui-button 
								v-if="userInfo.type === 'KT'" 
								title="수업 완료"
								:class="['ico-btn', 'finish-btn']" 
								@button:click="onStudyFinish">
							</ui-button>

							<div class="line" v-if="userInfo.type === 'KT'"></div>

							<ui-button 
								:title="!this.isLocalRec ? '로컬녹화 시작' : '로컬녹화 중지'"
								:class="['ico-btn', 'local-rec-btn', this.isLocalRec ? 'active' : '']"
								@button:click="onLocalRecord">
							</ui-button>

							<span class="count-time">{{mainCountTime}}</span>

						</div>
						<!-- //viewer-menu -->
						
						<!-- blind-con -->
						<transition name="fade-long">
							<div class="blind-con" v-show="isShowBlind"></div>
						</transition>
						<!-- //blind-con -->

						<!-- zoom-mode-con -->
						<transition name="fade">
							<div class="zoom-mode-con" v-show="currentOwner === userInfo.type && zoomMode.enabled">
								<label>
									<input type="checkbox" v-model="zoomHideLeftBar">
									<span class="check-icon"></span>
									좌측바 가리기
								</label>
								<label>
									<input type="checkbox" v-model="zoomPreviewStudy">
									<span class="check-icon"></span>
									교안 preview
								</label>
							</div>
						</transition>
						<!-- //zoom-mode-con -->

						<!-- loading-con -->
						<transition name="fade-out">
							<div class="loading-con" v-show="!studyLoaded || !initData">
								<div>
									<img src="~@/assets/images/common/loading.gif" /><br />
									수업을 시작하고 있습니다.<br />잠시만 기다려 주세요.
								</div>
							</div>
						</transition>
						<!-- //loading-con -->

					</div>
					<!-- //viewer-content -->
					
				</div>
				<!-- //viewer-right -->

				<!-- video-con -->
				<div ref="videoCon" class="video-con">

					<div ref="teacherCon1" 
						:class="['teacher-con1', currentOwner === 'KT' ? 'disable' : '', !teacherStream1 && !findRoomIn('KT') ? 'no-join' : '', !teacherStream1 && findRoomIn('KT') ? 'no-video' : '']" 
						v-show="currentOwner === 'KT' || findRoomIn('KT')">
						<video ref="teacherVideo1" muted autoplay playsinline v-show="teacherStream1"></video>
						<mic-button v-show="currentOwner === 'KT' && userInfo.type !== 'KT' && findRoomIn('KT')" :button="false" stream="KT" />
						<ui-button v-if="userInfo.type === 'KT' && currentOwner === 'FT'" class="report-btn" />
					</div>

					<p class="name teacher">{{findMember(currentOwner).name}}</p>

					<div ref="studentCon" 
						:class="['student-con', !studentStream && !findRoomIn('ST') ? 'no-join' : '', !studentStream && findRoomIn('ST') ? 'no-video' : '']">
						<video ref="studentVideo" muted autoplay playsinline v-show="studentStream"></video>
						<mic-button v-show="userInfo.type !== 'ST' && findRoomIn('ST')" :button="false" stream="ST" />
					</div>

					<p class="name student">{{findMember('ST').name}}</p>

					<div ref="teacherCon2" 
						:class="['teacher-con2', currentOwner === 'FT' ? 'disable' : '', !teacherStream2 && !findRoomIn('FT') ? 'no-join' : '', !teacherStream2 && findRoomIn('FT') ? 'no-video' : '']" 
						v-show="currentOwner === 'FT' || findRoomIn('FT')">
						<video ref="teacherVideo2" muted autoplay playsinline v-show="teacherStream2"></video>
						<mic-button v-show="currentOwner === 'FT' && userInfo.type !== 'FT' && findRoomIn('FT')" :button="false" stream="FT" />
					</div>

				</div>
				<!-- //video-con -->

			</div>
			<!-- //viewer-wrap -->

			<!-- white-board-tool -->
			<white-board ref="whiteBoard" v-show="!zoomMode.enabled" @white-mode="onWhiteMode" />
			<!-- //white-board-tool -->

			<!-- board-btn -->
			<ui-button 
				v-show="currentOwner === userInfo.type && studyLoaded && !zoomMode.enabled"
				:title="whiteBoardStatuse !== 'open' ? '판서열기' : '판서닫기'"
				:class="['board-btn', whiteBoardStatuse == 'open' ? 'active':'']" 
				@button:click="onWhiteBoard">
			</ui-button>
			<!-- //board-btn -->

			<!-- ranking-view -->
			<ranking-view ref="rankingView" @close="onHideRanking"  />
			<!-- //ranking-view -->

			<!-- timer-view -->
			<timer-view ref="timerView" @cancel="onCancelTimer"  />
			<!-- //timer-view -->

		</div>
		<!-- //viewer-container -->

		<!-- dice-view -->
		<dice-view ref="diceView" 
			@dropdice="onDropDice" 
			@start="() => isShowBlind = true" 
			@finish="() => isShowBlind = false">
		</dice-view>
		<!-- //dice-view -->
		
		<!-- hand-game-view -->
		<hand-game-view ref="handGameView" 
			@start="() => isShowBlind = true" 
			@finish="() => isShowBlind = false">
		</hand-game-view>
		<!-- //hand-game-view -->

		<!-- buzzer-view -->
		<buzzer-view ref="buzzerView" 
			@start="() => isShowBlind = true" 
			@finish="() => isShowBlind = false">
		</buzzer-view>
		<!-- //buzzer-view -->
		
		<!-- config-popup -->
		<transition name="transition-up">
			<config-popup ref="configPopup" v-if="deviceLists" :deviceLists="deviceLists" @submit="onSubmitConfig" />
		</transition>
		<!-- //config-popup -->

		<!-- timer-popup -->
		<transition name="transition-up">
			<timer-popup v-if="showTimerPopup" @submit="onSubmitTimer" />
		</transition>
		<!-- //timer-popup -->

		<!-- image-viewer -->
		<image-viewer ref="imageViewer" 
			:image-list="homeworkPicData"
			:remote="currentOwner !== userInfo.type"
			@close="onCloseImageViewer"
			@scroll="onScrollImageViewer"
			@image-loaded="onLoadImageViewer" />
		<!-- //image-viewer -->

		<!-- text-viewer -->
		<text-viewer ref="textViewer"
			:init-data="homeworkNoteData.noteData"
			:remote="currentOwner !== userInfo.type"
			viewer-type="note"
			:useEditMode="false"
			@close="onCloseTextViewer"
			@scroll="onScrollTextViewer">
		</text-viewer>
		<!-- //text-viewer -->

		<study-point-viewer v-if="studyInfo.ucode"
			ref="studyPointViewer"
			:init-data="homeworkReportData"
			:part="$ucodeToPart(studyInfo.ucode)"
			:remote="currentOwner !== userInfo.type"
			:mode="currentOwner === userInfo.type ? 'edit' : 'view'"
			@close="onCloseStudyPointViewer"
			@update="onUpdateStudyPointViewer" />

    </div>
</template>

<script>

import { gsap, Cubic, Linear } from 'gsap'
import { Draggable } from "gsap/Draggable" 
import _ from 'lodash'

import JanusService from '@/libs/janusService'
import RecorderService, { 
	ServerRecorder, 
	LocalRecorder
} from '@/libs/recorderService'

import PointsChatting from '@/components/study/PointsChatting'
import WhiteBoard from '@/components/study/WhiteBoard'
import ConfigPopup from '@/components/study/ConfigPopup'
import TimerPopup from '@/components/study/TimerPopup'
import TimerView from '@/components/study/TimerView'
import BuzzerView from '@/components/study/BuzzerView'
import DiceView from '@/components/study/DiceView'
import HandGameView from '@/components/study/HandGameView'
import RankingView from '@/components/study/RankingView'
import MicButton from '@/components/study/MicButton'
import VolumeButton from '@/components/study/VolumeButton'
import ImageViewer from '@/components/myself/ImageViewer'
import TextViewer from '@/components/myself/TextViewer'
import StudyPointViewer from '@/components/myself/StudyPointViewer'

var RTC_URL = null;
var REC_URL = null;
var API_SECRETE = ''


export default {
	
	name: 'mainStudy',

	components: {
		PointsChatting,
		WhiteBoard,
		ConfigPopup,
		TimerPopup,
		TimerView,
		BuzzerView,
		DiceView,
		HandGameView,
		RankingView,
		MicButton,
		VolumeButton,
		ImageViewer,
		TextViewer,
		StudyPointViewer
	},

	data () {
		return {
			initData: false,
			studyInitData: null,
			studyLoadStart: false,
			studyLoaded: false,
			sendText: '',
			isServerRec: false,
			isLocalRec: false,
			isShareScreen: false,
			timer: null,
			studyWindow: null,
			deviceLists: null,
			showTimerPopup: false,
			dragPosition:{x: 300, y: 820},
			activeBtnLength: 5,
			showDiceCount: 0,
			showHandCount: 0,
			handIndex: 0,
			draggables: null,
			mainCountTime: '00:00',
			isShowBlind: false,
			firstTeature: 'K',
			zoomHideLeftBar: this.$store.getters['study/mainStudy/getZoomMode'].hideLeftBar,
			zoomPreviewStudy: this.$store.getters['study/mainStudy/getZoomMode'].previewStudy,
			homeworkPicData: {
				images: [],
				scrollY: 0
			},
			homeworkNoteData: {
				noteData: null,
				scrollY: 0
			},
			homeworkReportData: {
				show: false,
				sdl_ucode: '',
				hmwk_off_w: [[]],
				hmwk_off_s: [[]],
				hmwk_off_q: [[]],
				checkLists: {W: [], S: [], Q: []},
				tabIndex: 1,
				slideIndex: 1
			},
			charactorNum: 0,
			maxCharactor: 6,
			studyTime: {
				kt: 0,
				ft: 0,
				current: 0
			}
		}
	},

	computed: {
		
		teacherStream1 () {
			const stream = this.$store.getters['study/mainStudy/getStream']('KT')
			if(stream) {
				this.$refs.teacherVideo1.srcObject = stream
				if(this.userInfo.type === 'KT') {
					this.$refs.teacherVideo1.muted = true
				} else {
					if(this.currentOwner === 'KT') {
						this.$refs.teacherVideo1.muted = false
					} else {
						this.$refs.teacherVideo1.muted = true
					}
				}
				RecorderService.updateStream(stream)
			}
			return stream
		},
		
		teacherStream2 () {
			const stream = this.$store.getters['study/mainStudy/getStream']('FT')
			if(stream) {
				this.$refs.teacherVideo2.srcObject = stream
				if(this.userInfo.type === 'FT') {
					this.$refs.teacherVideo2.muted = true
				} else {
					if(this.currentOwner === 'FT') {
						this.$refs.teacherVideo2.muted = false
					} else {
						this.$refs.teacherVideo2.muted = true
					}
				}
				RecorderService.updateStream(stream)
			}
			return stream
		},

		studentStream () {
			const stream = this.$store.getters['study/mainStudy/getStream']('ST')
			if(stream) {
				this.$refs.studentVideo.srcObject = stream
				this.$refs.studentVideo.muted = this.userInfo.type === 'ST' ? true : false
				RecorderService.updateStream(stream)
			}
			return stream
		},

		screenStream() {
			const stream = this.$store.getters['study/mainStudy/getStream']('SS')
			if(stream) {
				this.$refs.screenShareVideo.srcObject = stream
				if(this.userInfo.type === 'KT') {
					this.$refs.screenShareVideo.muted = true
				}
			}
			return stream
		},

		roomCode() {
			return this.$store.getters['study/mainStudy/getRoomCode']
		},

		findRoomIn () {
			return ( type ) => {
				return this.roomLists.find( x => x.type === type)
			}
		},

		findMember() {
			return ( type ) => {
				return _.find(this.memberInfo, {type: type})
			}
		},

		roomLists () {
			return [
				this.userInfo, 
				...this.$store.getters['study/mainStudy/getRoomLists']
			]
		},

		messageLists () {
			return this.$store.getters['study/mainStudy/getMessages']
		},
		
		whiteBoardStatuse () {
			return this.$store.getters['study/mainStudy/getWhiteBoard'].status
		},

		whiteMode () {
			return this.$store.getters['study/mainStudy/getWhiteBoard'].whiteMode
		},
		
		whiteBoardData () {
			return { 
				data: this.$store.getters['study/mainStudy/getWhiteBoard'].data,
				historyUndo: this.$store.getters['study/mainStudy/getWhiteBoard'].historyUndo,
				historyRedo: this.$store.getters['study/mainStudy/getWhiteBoard'].historyRedo
			}
		},

		viewerConfigs () {
			return this.$store.getters['study/mainStudy/getConfigs']
		},

		currentOwner () {
			return this.$store.getters['study/mainStudy/getOwner']
		},

		zoomMode () {
			const zoomMode = this.$store.getters['study/mainStudy/getZoomMode']
			this.zoomHideLeftBar = zoomMode.hideLeftBar
			this.zoomPreviewStudy = zoomMode.previewStudy
			return zoomMode
		},

		micMuted () {
			return this.$store.getters['study/mainStudy/getMicMuted']
		},

		studyPages () {
			return this.$store.getters['study/mainStudy/getStudyPages']
		},

		STPermissions () {
			return this.$store.getters['study/mainStudy/getSTPermissions']
		},

		studyPart () {
			return this.studyInfo.ucode.split('_')[1].slice(0, 1)
		}
	},

	watch: {
		
		screenStream () {
			if(this.userInfo.type === 'KT') {
				const stream = this.$store.getters['study/mainStudy/getStream']('SS')
				if(stream) {
					stream.getVideoTracks()[0].onended = () => {
						JanusService.stopShareScreen()
						this.isShareScreen = false
					}
				}
			}
		},

		currentOwner ( newVal ) {
			if(this.userInfo.type === 'KT') {
				if(newVal === 'FT') {
					this.$refs.teacherVideo2.muted = false
				} else {
					this.$refs.teacherVideo2.muted = true
				}
			} else if(this.userInfo.type === 'FT') {
				if(newVal === 'KT') {
					this.$refs.teacherVideo1.muted = false
				} else {
					this.$refs.teacherVideo1.muted = true
				}
			} else {
				if(newVal === 'KT') {
					this.$refs.teacherVideo1.muted = false
					this.$refs.teacherVideo2.muted = true
				} else {
					this.$refs.teacherVideo1.muted = true
					this.$refs.teacherVideo2.muted = false
				}
			}
			
			if(newVal === 'KT') {
				if(this.userInfo.type === 'FT') JanusService.setBitrate( 'mini' )
				if(this.userInfo.type === 'KT') JanusService.setBitrate( this.viewerConfigs.qulity )
			} else {
				if(this.userInfo.type === 'FT') JanusService.setBitrate( this.viewerConfigs.qulity )
				if(this.userInfo.type === 'KT') JanusService.setBitrate( 'mini' )
			}
		},

		studyStatus ( newVal ) {
			if(newVal === 'onStudy') {
				if(!this.isServerRec && this.userInfo.type === 'KT') {
					this.$confirm({
						message: '수업 전에 반드시<br />서버녹화모드를 실행해주세요.<br /><br />지금 서버녹화모드를 실행하시겠습니까?',
						button: [{ name: '지금 녹화 설정' }],
						callback: () => {
							this.onServerRecord()
						}
					})
				}
				this.updatePoints();
			} else if(newVal === 'off') {
				// JanusService.destroy( true )
				// RecorderService.destroy()
				// this.$confirm({
				// 	message: '수업 시간이 종료 되었습니다.',
				// 	button: [{ name: '확인' }],
				// 	callback: () => {
				// 		JanusService.destroy()
				// 		self.close()
				// 	}
				// })
				
			}
			if(this.studyWindow) {
				this.studyWindow.onreceiveviewermessage({ name: 'study-status', value: this.studyStatus })
			}
		},

		micMuted ( newVal ) {
			JanusService.setAudioMuted( newVal )
		},

		whiteBoardStatuse ( newVal ) {
			this.studyWindow.onreceiveviewermessage({ name: 'white-board', value: newVal })
		},

		async zoomHideLeftBar ( newVal ) {
			this.$store.dispatch('study/mainStudy/setZoomMode', { hideLeftBar : newVal })
			await this.sendJanusData( 'zoom-mode', this.zoomMode )
			this.zoomChange ()
		},

		async zoomPreviewStudy ( newVal ) { 
			this.$store.dispatch('study/mainStudy/setZoomMode', { previewStudy : newVal })
			await this.sendJanusData( 'zoom-mode', this.zoomMode )
			this.zoomChange ()
		}
	},

	async mounted () {
		if(!this.userInfo.id) return

		await this.updatePoints()

		if(this.$config.studyInfoType === 'api') {
			const viewerInfo = JSON.parse(window.sessionStorage.getItem('viewerInfo'))
			const result = await this.$http.post(`${this.$config.LMSApiURL}/getStartMainClass`, { 
				pcd_seq: this.userInfo.pcd_seq,
				mem_id: this.userInfo.id 
			})

			if(!viewerInfo.is_test) {
				this.$store.dispatch('study/mainStudy/setRoomCode', result.data['room_code'])
			}

			this.firstTeature = result.data['first_tch']

			if(result.data.rtc_url) {
				RTC_URL = `wss://${result.data.rtc_url}/janus`
			}

			if(result.data.rec_url) {
				REC_URL = `https://${result.data.rec_url}`
			}
			
			if(result.data.rtc_pw) {
				API_SECRETE = result.data.rtc_pw
			}
			// this.firstTeature = 'F'
		}

		const unload = async () => {
			JanusService.destroy()
			await this.$http.post(`${this.$config.LMSApiURL}/setEndClass`, { 
				pcd_seq: this.userInfo.pcd_seq,
				user_type: this.userInfo.type
			});
		}

		this.$eventBus
			.$on('janus:changeRoomList', this.onJanusRoomList)
			.$on('janus:receiveData', this.onJanusData)
			.$on('janus:error', this.onJanusError)
			.$on('whiteboard:change', this.onChangeWiteBoard)
			.$on('studyframe:reciveMessage', this.onStudyFrameMessage)
			.$on('studyframe:reciveData', this.onStudyFrameData)
			.$on('timeupdate', this.onTimeupdate)
			.$on('deviceChange', this.onDeviceChange)
			.$on('window:beforeUnload', unload)
			.$on('window:unload', unload)
		

		this.onTimeupdate(this.$eventBus.now)
		this.$forceUpdate()

		gsap.killTweensOf(this.$refs.teacherCon1)
		gsap.killTweensOf(this.$refs.teacherCon2)

		this.draggables = Draggable.create([this.$refs.teacherCon1, this.$refs.teacherCon2], {
			type: 'x,y',
			bounds: '.viewer-wrapper',
			onDragStart: () => {
				this.$refs.studyContent.style['pointer-events'] = 'none'
			},
			onClick: ( e ) => {
				if(e.target.classList.contains('report-btn')) {
					window.open(`https://ybmlemon.com/LMS/teacher/teacherObserDetail/${this.userInfo.pcd_seq}`)
				}
			},
			onDragEnd: ( e ) => {
				if(this.currentOwner === 'KT') {
					this.dragPosition = {x: parseInt(this.$refs.teacherCon2._gsap.x), y: parseInt(this.$refs.teacherCon2._gsap.y)}
				} else {
					this.dragPosition = {x: parseInt(this.$refs.teacherCon1._gsap.x), y: parseInt(this.$refs.teacherCon1._gsap.y)}
				}
				this.$refs.studyContent.style['pointer-events'] = ''
			}
		})

		if(this.userInfo.type === 'ST') {
			this.draggables.forEach(drag => {
				drag.disable()
			});
		}
		
		
		if(this.currentOwner === 'KT') {
			gsap.set(this.$refs.teacherCon1, {x: 0, y: 0})
			gsap.set(this.$refs.teacherCon2, {...this.dragPosition})
		} else {
			gsap.set(this.$refs.teacherCon1, {...this.dragPosition})
			gsap.set(this.$refs.teacherCon2, {x: 0, y: 0})
		}
		gsap.set(this.$refs.studentCon, {y: 247})

		this.onChangeVolume( this.$store.getters['study/mainStudy/getVolume'] )
		RecorderService.init( this.$eventBus, this.$store, REC_URL)

		this.studyLoadStart = true

		if(this.userInfo.type === 'KT' && this.studyStatus === 'onStudy') {
			this.$confirm({
				message: '수업 전에 반드시<br />서버녹화모드를 실행해주세요.<br /><br />지금 서버녹화모드를 실행하시겠습니까?',
				button: [{ name: '지금 녹화 설정' }],
				callback: () => {
					this.onServerRecord()
				}
			})
		}
		
		// this.initJanus()
		
	},

	beforeDestroy () {
		this.$store.dispatch('study/mainStudy/removeAllStream')
		this.$store.dispatch('study/mainStudy/setWhiteBoard', {status: 'close', data: null})
		this.$eventBus
			.$off('janus:changeRoomList')
			.$off('janus:receiveData')
			.$off('janus:error')
			.$off('whiteboard:change')
			.$off('studyframe:reciveMessage', this.onStudyFrameMessage)
			.$off('studyframe:reciveData', this.onStudyFrameData)
			.$off('timeupdate', this.onTimeupdate)
			.$off('deviceChange', this.onDeviceChange)
			.$off('window:beforeUnload')
			.$off('window:unload')

		this.$refs.studyContent.src= ''
		RecorderService.destroy()
		JanusService.destroy()
		this.draggables.forEach( draggable => {
			draggable.kill()
		})
		this.$http.post(`${this.$config.LMSApiURL}/setEndClass`, { 
			pcd_seq: this.userInfo.pcd_seq,
			user_type: this.userInfo.type
		})
		
		gsap.killTweensOf('*')
	},

	destroyed () {
		this.$store.dispatch('study/mainStudy/reset')
	},

	methods: {
		async initJanus () {
			try{
				await JanusService.init( this.roomCode, this.$store, this.$eventBus, RTC_URL, API_SECRETE )
				const deviceList = await JanusService.getDeviceLists()
				deviceList.forEach(async ( list ) => {
					if(list.kind === 'videoinput') {
						if(this.viewerConfigs.videoInput === '')    await this.$store.dispatch('study/mainStudy/setConfigs', { videoInput: list.deviceId })
					} else if(list.kind === 'audioinput') {
						if(this.viewerConfigs.audioInput === '')    await this.$store.dispatch('study/mainStudy/setConfigs', { audioInput: list.deviceId })
					} else {
						if(this.viewerConfigs.audioOutput === '')   await this.$store.dispatch('study/mainStudy/setConfigs', { audioOutput: list.deviceId })
					}
				})
			} catch ( e ) {
				if(e.message) {
					if(e.message === 'WebrtcNotSupported') {
						this.$confirm({
							message: '화상을 지원하지 않는 브라우저 입니다.',
							submessage: 'This browser does not support this online learning program.',
							button: [{ name: '확인' }],
							callback: callback
						})
					} else {
						this.$confirm({
							message: '화상수업 연결에 실패 하였습니다.',
							submessage: 'The connection of the onlne video classroom has failed.',
							button: [{ name: '확인' }],
							callback: callback
						})
					}
				}
				console.error(e)
				function callback() {
					JanusService.destroy()
					self.close()
				}
			}
		},

		async sendMessage ( msg ) {
			await this.sendJanusData( 'message', msg )
		},

		onJanusRoomList ( result ) {
			clearTimeout(this.timer)
			this.timer = setTimeout(async () => {
				this.$store.dispatch('study/mainStudy/setRoomList', result.lists)
				// if(result.type === 'leave') { 
				// 	if(!this.findRoomIn('FT') && this.currentOwner === 'FT') {
				// 		this.onPermissionFT()   
				// 	}
				// }

				if(result.lists.length == 0) {
					if(!this.initData) {
						if(this.firstTeature === 'F') {
							await this.$store.dispatch('study/mainStudy/setOwner', 'FT')
							this.$refs.teacherCon1.style['transition'] = 'none'
							this.$refs.teacherCon2.style['transition'] = 'none'
							gsap.set(this.$refs.teacherCon1, {...this.dragPosition})
							gsap.set(this.$refs.teacherCon2, {x: 0, y: 0})
							setTimeout(() => {
								this.$refs.teacherCon1.style['transition'] = ''
								this.$refs.teacherCon2.style['transition'] = ''
							}, 1000)
						}
						this.initStudyModule(true)
						this.charactorNum = Math.floor(Math.random() * this.maxCharactor) + 1
					}
					this.initData = true
					return
				} 

				if( result.type.indexOf('join') > -1) {
					if(this.initData) {
						await this.sendJanusData('init', JSON.stringify({
							owner: this.currentOwner,
							messages: this.messageLists, 
							whiteBoardStatuse: this.whiteBoardStatuse,
							whiteBoardData: this.whiteBoardData,
							whiteMode: this.whiteMode,
							zoomMode: this.zoomMode,
							studyData: this.studyWindow.INIT_DATA,
							STPermissions: this.STPermissions,
							homeworkPicData: this.homeworkPicData,
							homeworkNoteData: this.homeworkNoteData,
							homeworkReportData: this.homeworkReportData,
							charactorNum: this.charactorNum,
							rankingShow: this.$refs.rankingView.isShow
						}))
					}
				} 
			}, 100)
		},

		sendJanusData (type, data) {
			// if(this.studyStatus === 'onStudy' || type === "permission" || type === "zoom-mode" || type === "message") {
			// 	return JanusService.sendData(type, data)
			// }
			return JanusService.sendData(type, data)
		},

		async onJanusData( respons ) {
			const json = JSON.parse( respons )
			const datas = JSON.parse(json.text)
			const date = json.date
			console.log('receiveData :: ', datas)
			switch(datas.type) {
				case 'init' :
					if(!this.initData) { 
						const data = JSON.parse(datas.data)
						this.$store.dispatch('study/mainStudy/setOwner', data.owner)
						this.$store.dispatch('study/mainStudy/setMessages', data.messages)
						this.$store.dispatch('study/mainStudy/setWhiteBoard', {
							status: data.whiteBoardStatuse,
							whiteMode: data.whiteMode, 
							...data.whiteBoardData
						})
						this.$store.dispatch('study/mainStudy/setZoomMode', data.zoomMode)
						this.$store.dispatch('study/mainStudy/setSTPermissions', data.STPermissions)

						if(this.currentOwner === 'FT')  this.permissionChange(0)
						if(this.zoomMode.enabled)       this.zoomChange(0)

						this.$refs.whiteBoard.init()
						this.$refs.pointsChatting.init()

						this.studyInitData = data.studyData
						this.homeworkPicData = data.homeworkPicData
						if(this.homeworkPicData.images && this.homeworkPicData.images.length > 0) {
							this.$refs.imageViewer.show = true
						}

						this.homeworkNoteData = data.homeworkNoteData
						if(this.homeworkNoteData.noteData) {
							this.$refs.textViewer.show = true
							setTimeout(()=>{
								this.$refs.textViewer.updateScroll(this.homeworkNoteData.scrollY)
							})
						}

						this.homeworkReportData = data.homeworkReportData
						if(this.homeworkReportData.show === true) {
							this.$refs.studyPointViewer.show = true
							setTimeout(()=>{
								this.$refs.studyPointViewer.updateData(this.homeworkReportData)
							})
						}
						this.charactorNum = data.charactorNum

						if(data.rankingShow) {
							this.onShowRanking( true )
						}

						this.initStudyModule(true)
						this.initData = true
					}
				break;
				case 'message' :
					const message = {
						id: datas.userInfo.id, 
						type: datas.userInfo.type,
						name: datas.userInfo.name, 
						text: datas.data,
						date: date
					}
					this.$store.dispatch('study/mainStudy/setMessage', message)
				break;
				case 'white-board-open' :
					if(datas.userInfo.id !== this.userInfo.id) {
						this.$store.dispatch('study/mainStudy/setWhiteBoard', { status: datas.data })
					}
				break;
				case 'white-mode' :
					if(datas.userInfo.id !== this.userInfo.id) {
						this.$store.dispatch('study/mainStudy/setWhiteBoard', { whiteMode: datas.data })
					}
				break;
				case 'white-board-data' :
					if(datas.userInfo.id !== this.userInfo.id) {
						this.$refs.whiteBoard.updateData( JSON.parse(datas.data) )
					}
				break;
				case 'studyframe' :
					this.studyWindow.onreceiveviewerdata({
						sender: datas.userInfo.id,
						data: datas.data 
					})
				break;
				case 'timer' :
					if(datas.userInfo.id !== this.userInfo.id) {
						this.$refs.timerView.start( parseInt( datas.data ) )
					}
				break;
				case 'timer-cancel' :
					if(datas.userInfo.id !== this.userInfo.id) {
						this.$refs.timerView.stop()
					}
				break;
				case 'permission' :
					this.$store.dispatch('study/mainStudy/setOwner', datas.data )
					this.permissionChange()
				break;
				case 'st-permission' :
					switch(datas.data.type) {
						case 'buzzer' :
							this.$store.dispatch('study/mainStudy/setSTPermissions', { buzzer: datas.data.value })
						break
						case 'dice' :
							this.$store.dispatch('study/mainStudy/setSTPermissions', { dice: datas.data.value })
						break
						case 'board' :
							this.$store.dispatch('study/mainStudy/setSTPermissions', { board: datas.data.value })
						break
						case 'activity' :
							this.$store.dispatch('study/mainStudy/setSTPermissions', { activity: datas.data.value })
						break
						case 'chatting' :
							this.$store.dispatch('study/mainStudy/setSTPermissions', { chatting: datas.data.value })
						break
					}
				break;
				case 'zoom-mode' :
					if(datas.userInfo.id !== this.userInfo.id) {
						this.$store.dispatch('study/mainStudy/setZoomMode', datas.data)
						this.zoomChange()
					}
				break;
				case 'start-dice' :
					this.showDiceCount = this.activeBtnLength
					this.$forceUpdate()
					gsap.killTweensOf(this.$refs.diceProgressBar)
					setTimeout(()=> {
						gsap.set(this.$refs.diceProgressBar, { width:0 })
						gsap.to(this.$refs.diceProgressBar, this.activeBtnLength - 0.5, { width: '100%', ease:Linear.easeNone })
					})
				break;
				case 'drop-dice' :
					this.showDiceCount = 0
					if(datas.userInfo.id !== this.userInfo.id) {
						this.$refs.diceView.start(datas.data.mode, datas.data.dropValue)
					}
				break;
				case 'start-hand-game' :
					this.$refs.handGameView.stop()
					this.showHandCount = this.activeBtnLength
					if(this.userInfo.type === 'ST') {
						this.handIndex = parseInt( datas.data )
					}
					gsap.killTweensOf(this.$refs.handProgressBar)
					setTimeout(()=> {
						gsap.set(this.$refs.handProgressBar, { width:0 })
						gsap.to(this.$refs.handProgressBar, this.activeBtnLength - 0.5, { width: '100%', ease:Linear.easeNone })
					})
				break;
				case 'drop-hand-game' :
					this.$refs.handGameView.start(datas.data.hand1, datas.data.hand2)
					this.showHandCount = 0
					this.handIndex = 0
				break;
				case 'start-buzzer' :
					if(datas.userInfo.id !== this.userInfo.id) {
						this.$refs.buzzerView.start()
					}
				break;
				case 'hmwk-off-pic' :
					if(datas.userInfo.id !== this.userInfo.id) {
						if(datas.data.show === true) {
							this.homeworkPicData.images = [ datas.data.image ]
							this.$refs.imageViewer.show = true
						} else if(datas.data.show === false) {
							this.homeworkPicData = { images: [], scrollY: 0}
							this.$refs.imageViewer.show = false
						}
						if(typeof datas.data.scrollY === 'number') {
							this.homeworkPicData.scrollY = datas.data.scrollY
							this.$refs.imageViewer.updateScroll(datas.data.scrollY)
						}
					}
				break;
				case 'hmwk-off-note' :
					if(datas.userInfo.id !== this.userInfo.id) {
						if(datas.data.show === true) {
							this.homeworkNoteData.noteData = datas.data.noteData
							this.$refs.textViewer.show = true
						} else if(datas.data.show === false) {
							this.homeworkNoteData = { noteData: null, scrollY: 0}
							this.$refs.textViewer.show = false
						}
						if(typeof datas.data.scrollY === 'number') {
							this.homeworkNoteData.scrollY = datas.data.scrollY
							this.$refs.textViewer.updateScroll(datas.data.scrollY)
						}
					}
				break;
				case 'hmwk-class-report' :
					if(datas.userInfo.id !== this.userInfo.id) {
						if(datas.data.show === true) {
							this.homeworkReportData = datas.data.reportData
							this.$refs.studyPointViewer.show = true
						} else if(datas.data.show === false) {
							this.homeworkReportData = { 
								show: false,
								sdl_ucode: '', 
								hmwk_off_w: [[]], 
								hmwk_off_s: [[]], 
								hmwk_off_q: [[]],
								checkLists: {W: [], S: [], Q: []},
								tabIndex: 1,
								slideIndex: 1
							}
							this.$refs.studyPointViewer.show = false
						}
						if(datas.data.updateData) {
							this.$refs.studyPointViewer.updateData( datas.data.updateData )
						}
					}
				break;
				case 'ranking-view' :
					if(datas.userInfo.id !== this.userInfo.id) {
						if(datas.data.value) {
							this.onShowRanking( true )
						} else {
							this.onHideRanking( true )
						}
					}
				break;
				case 'main-class-finish' :
					if(datas.userInfo.id !== this.userInfo.id) {
						if(this.userInfo.type === 'ST' && this.studyMode === 'study') {
							if(!this.studyInfo.isAtest) {
								this.$confirm({
									message: '이어서 After Class 학습을<br />바로 시작하시겠습니까?',
									button: [{ name: '나중에 학습', value: false }, { name: '바로 학습', value: true }],
									callback: ( value ) => {
										if(value) {
											this.$router.push({name: 'AfterStudy'})
										} else {
											this.$store.dispatch('setStudyInfo', {afterWait: true})
											this.$router.push({name: 'Study'})
										}
									}
								})
							} else {
								this.$confirm({
									message: '학습이 종료되었습니다.',
									button: [{ name: '확인' }],
									callback: () => {
										location.href = this.$baseUrl
									}
								})
							}
						} else {
							this.$confirm({
								message: '학습이 종료되었습니다.',
								button: [{ name: '확인' }],
								callback: () => {
									self.close()
								}
							})
						}
					} else {
						self.close()
					}
				break;
			}
		},

		onServerRecord () {
			if(!this.isServerRec) {
				ServerRecorder.startRecord()
				this.isServerRec= true
				this.$eventBus
				.$off("recorder:server:failed")
				.$off("recorder:server:disconnet")
				.$off("recorder:server:stop")
				.$once("recorder:server:failed", ( e ) => {
					console.log("recorder error", e)
					if( e.message.indexOf('xhr poll error') > -1 ) {
						this.$confirm({
							message: '녹화서버 연결에 실패 하였습니다.',
							button: [{ name: '확인' }],
						})
					} else {
						this.$confirm({
							message: '녹화를 취소 하였습니다.',
							button: [{ name: '확인' }],
						})
					}
					this.isServerRec= false
				})
				.$once("recorder:server:disconnet", ( e ) => {
					this.$confirm({
						message: '서버와의 연결이 끊어졌습니다. 녹화를 다시 진행해 주세요.',
						button: [{ name: '확인' }],
					})
				})
				.$once("recorder:server:stop", ( e ) => {
					this.isServerRec= false
				})
			} else {
				this.isServerRec= false
				ServerRecorder.stopRecord()
			}
		},

		onLocalRecord () {
			if(!this.isLocalRec) {
				LocalRecorder.startRecord()
				this.isLocalRec= true 
				this.$eventBus
				.$off("recorder:local:failed")
				.$off("recorder:local:stop")
				.$once("recorder:local:failed", ( e ) => {
					this.$confirm({
						message: '녹화를 취소 하였습니다.',
						button: [{ name: '확인' }],
					})
					this.isLocalRec= false
				})
				.$once("recorder:local:stop", ( e ) => {
					this.isLocalRec= false
				})
			} else {
				this.isLocalRec= false
				LocalRecorder.stopRecord()
			}
		},

		onShareScreen () {
			if(!this.isShareScreen) {
				JanusService.startShareScreen()
			} else {
				JanusService.stopShareScreen()
			}
			this.isShareScreen = !this.isShareScreen
		},

		onJanusError ( error ) {
			console.error(`JanusError( ${error.type} ):` , error.message)
			switch( error.message ) {
				case 'NotAllowedUserMedia' :
					this.$confirm({
						message: '카메라와 오디오 권한을 허용 해주세요.',
						submessage: 'Please allow camera and audio permissions.',
						button: [{ name: '확인' }],
						callback: callback
					})
				break
				case 'NotReadableError' :
					this.$confirm({
						message: '카메라가 다른 응용프로그램에서 사용중입니다.',
						submessage: 'The camera is occupied with another application.',
						button: [{ name: '확인' }],
						callback: callback
					})
				break
				case 'AlreadyExists' :
					this.$confirm({
						message: '이미 사용중인 아이디 입니다.',
						submessage: 'This ID is already taken.',
						button: [{ name: '확인' }],
						callback: callback
					})
				break
				case `No such room (${this.room})` :
					this.$confirm({
						message: '화상수업 방을 찾을수 없습니다.',
						submessage: 'The online video classroom could not be found.',
						button: [{ name: '확인' }],
						callback: callback
					})
				break
				case 'DestroyedRoom' :
					RecorderService.destroy()
					if(this.userInfo.type !== 'ST') {
						this.$confirm({
							message: '화상수업이 종료 되었습니다.',
							submessage: 'The online video class has ended.',
							button: [{ name: '확인' }],
							callback: callback
						})
					}
				break
				case 'No capture device found' :
					this.$store.dispatch('study/mainStudy/removeStream', this.userInfo.type)
					this.$confirm({
						message: '카메라장치를 찾을수 없습니다.',
						submessage: 'The camera device could not be found.',
						button: [{ name: '확인' }],
					})
				break
				case 'NotAllowedDisplayMedia' :
					this.isShareScreen = false
					JanusService.stopShareScreen()
					this.$confirm({
						message: '공유할 화면을 선택 해주세요.',
						button: [{ name: '확인' }],
					})
				break
			}
			function callback () {
				JanusService.destroy()
				self.close()
			}
		},

		async onWhiteBoard () {
			this.$store.dispatch('study/mainStudy/setWhiteBoard', { status: this.whiteBoardStatuse !== 'open' ? 'open': 'close'})
			await this.sendJanusData('white-board-open', String(this.whiteBoardStatuse))
		},

		async onWhiteMode ( flag ) {
			this.$store.dispatch('study/mainStudy/setWhiteBoard', { whiteMode: flag})
			await this.sendJanusData( 'white-mode', flag )
		},

		async onChangeWiteBoard ( datas ) {
			const boardData = this.whiteBoardData.data
			if(this.whiteMode) {
				boardData['white'] = datas.currentData
			} else {
				boardData[this.studyPages[0]+'_'+this.studyPages[1]] = datas.currentData
			} 
			this.$store.dispatch('study/mainStudy/setWhiteBoard', { 
				data: boardData,
				historyUndo: datas.undo, 
				historyRedo: datas.redo 
			})
			await this.sendJanusData('white-board-data', datas.updateData)
		},

		onStudyFrameMessage ( message ) {
			console.log('STUDY_MESSAGE :: ', message )
			var msg = typeof message === 'string'? message : message.name
			switch( msg ) {
				case 'module-ready' :
					this.studyWindow = this.$refs.studyContent.contentWindow
					this.studyWindow.onmouseup = this.studyWindow.touchend = ( e ) => {
						this.$eventBus.$emit('window:touchend', e)
					}
					this.studyWindow.USER_INFO = {
						...this.userInfo,
						...this.studyInfo,
						owner: this.currentOwner === this.userInfo.type
					}
					this.studyWindow.onreceiveviewermessage({ name: 'study-status', value: this.studyStatus })
					
					if(!this.initData) {
						this.initJanus()
					}
				break
				case 'module-loaded' : 
					this.studyLoaded = true
				break
				case 'page-change' : 
					this.$store.dispatch('study/mainStudy/setStudyPages', [message.num1, message.num2])
					this.$store.dispatch('study/mainStudy/setWhiteBoard', { 
						historyUndo: [], 
						historyRedo: []
					})
					this.$refs.whiteBoard.init()
				break
				case 'hmwk-off-pic' : 
					this.homeworkPicData.images = [ _.cloneDeep( message.value)  ]
					this.$refs.imageViewer.show = true
					this.sendJanusData('hmwk-off-pic', {show: true, image: this.homeworkPicData.images[0], scrollY: 0})
				break
				case 'hmwk-off-note' : 
					this.homeworkNoteData.noteData = _.cloneDeep(message.value)
					this.homeworkNoteData.noteData.comment = this.homeworkNoteData.noteData.memo
					delete this.homeworkNoteData.noteData.memo
					this.$refs.textViewer.show = true
					this.sendJanusData('hmwk-off-note', {show: true, noteData: this.homeworkNoteData.noteData, scrollY: 0})
				break
				case 'hmwk-class-report' : 
					if(message.value) {
						this.homeworkReportData.hmwk_off_w[0] = _.cloneDeep(message.value.W)
						this.homeworkReportData.hmwk_off_s[0] = _.cloneDeep(message.value.S)
						this.homeworkReportData.hmwk_off_q[0] = _.cloneDeep(message.value.Q)
					} else {
						this.homeworkReportData.hmwk_off_w[0] = []
						this.homeworkReportData.hmwk_off_s[0] = []
						this.homeworkReportData.hmwk_off_q[0] = []
					}
					this.homeworkReportData.sdl_ucode = this.studyInfo.ucode
					this.homeworkReportData.show = true
					this.$refs.studyPointViewer.show = true
					this.sendJanusData('hmwk-class-report', {show: true, reportData: this.homeworkReportData})
				break
				case 'point' : 
					if(this.studyMode === 'study') {
						setTimeout(()=> {
							this.updatePoints()
						}, 100)
					} else {
						if(this.currentOwner === this.userInfo.type){
							this.$confirm({
								message: '체험모드에서는 포인트를 사용할 수 없습니다.',
								submessage: 'Points cannot be given in trial mode. ',
								button: [{ name: '확인'}]
							})
						}
					}
				break
			}
			
		},

		async onStudyFrameData ( data ) {
			// console.log("STUDY RECIVE DATA :: ", JSON.parse(data))
			await this.sendJanusData( 'studyframe', data )
		},

		async onConfigShow () {
			this.deviceLists = await JanusService.getDeviceLists()
		},

		onSubmitConfig ( e ) {
			this.deviceLists = null
			if(e.type === 'enter') {
				if(this.viewerConfigs.qulity !== e.data.qulity) {
					this.$store.dispatch('study/mainStudy/setConfigs', { qulity: e.data.qulity })
					if(this.currentOwner === 'KT') {
						if(this.userInfo.type != 'FT') {
							JanusService.setBitrate( e.data.qulity )
						}
					} else {
						if(this.userInfo.type != 'KT') {
							JanusService.setBitrate( e.data.qulity )
						}
					}
				}

				const inputs = []
				if(this.viewerConfigs.videoInput !== e.data.videoInput) {
					this.$store.dispatch('study/mainStudy/setConfigs', { videoInput: e.data.videoInput })
					inputs.push('video')
				}
				if(this.viewerConfigs.audioInput !== e.data.audioInput) {
					this.$store.dispatch('study/mainStudy/setConfigs', { audioInput: e.data.audioInput })
					inputs.push('audio')
				}
				if(inputs.length > 0) {
					JanusService.setInputDevice( inputs )
				}

				if(this.viewerConfigs.audioOutput !== e.data.audioOutput) {
					this.$store.dispatch('study/mainStudy/setConfigs', { audioOutput: e.data.audioOutput })
					this.$refs.teacherVideo1.setSinkId(e.data.audioOutput)
					this.$refs.teacherVideo2.setSinkId(e.data.audioOutput)
					this.$refs.studentVideo.setSinkId(e.data.audioOutput)
				}
			}
		},

		async onSubmitTimer ( e ) {
			this.showTimerPopup = false
			if(e.type === 'enter') {
				await this.sendJanusData( 'timer', e.time )
				this.$refs.timerView.start( e.time )
			}
		},

		async onCancelTimer ( e ) {
			await this.sendJanusData( 'timer-cancel', '')
			this.$refs.timerView.stop()
		},

		async onPermissionFT () {
			
			if(!this.studyLoaded) return;

			if(this.zoomMode.enabled) {
				this.onZoomMode()
			}
			if(this.currentOwner === 'KT') {
				await this.sendJanusData( 'permission', 'FT' )
			} else {
				await this.sendJanusData( 'permission', 'KT' )
			}
		},

		permissionChange (speed = 1) {
			if(speed == 0) {
				this.$refs.teacherCon1.style['transition'] = 'none'
				this.$refs.teacherCon2.style['transition'] = 'none'
				setTimeout(() => {
					this.$refs.teacherCon1.style['transition'] = ''
					this.$refs.teacherCon2.style['transition'] = ''
				}, 1000)
			}
			let inTeacher = this.$refs.teacherCon1
			let outTeacher = this.$refs.teacherCon2
			
			if(this.currentOwner === 'FT') {
				inTeacher = this.$refs.teacherCon2
				outTeacher = this.$refs.teacherCon1
				if(this.userInfo.type !== 'ST'){
					this.draggables[1].disable();
					this.draggables[0].enable();
				} else {
					this.draggables[1].disable();
					this.draggables[0].disable();
				}
			} else {
				if(this.userInfo.type !== 'ST'){
					this.draggables[0].disable();
					this.draggables[1].enable();	
				} else {
					this.draggables[0].disable();
					this.draggables[1].disable();	
				}
			}
			
			inTeacher.classList.add('disable')
			outTeacher.classList.remove('disable')

			this.dragPosition = {x: 300, y: 820}

			gsap.to(inTeacher, speed, {x: 0, y: 0, ease: Cubic.easeInOut})
			gsap.to(outTeacher, speed, {...this.dragPosition, ease: Cubic.easeInOut})
			
			this.studyWindow.USER_INFO.owner = this.currentOwner
			if(this.$ucodeToPart(this.studyInfo.ucode) === 'S' && this.initData) {
				this.studyInitData = null
				this.initStudyModule()
				this.studyLoaded = false
			}
		},

		async onZoomMode () {
			this.$store.dispatch('study/mainStudy/setZoomMode', {enabled: !this.zoomMode.enabled})
			this.zoomChange ()
			await this.sendJanusData( 'zoom-mode', this.zoomMode )
		},

		zoomChange (speed = 1) {
			const teacher = this.currentOwner === 'KT' ? this.$refs.teacherCon1 : this.$refs.teacherCon2
			const student = this.$refs.studentCon
			if(speed == 0) {
				teacher.style['transition'] = 'none'
				student.style['transition'] = 'none'
				this.$refs.videoCon.style['transition'] = 'none'
				setTimeout(() => {
					teacher.style['transition'] = ''
					student.style['transition'] = ''
					this.$refs.videoCon.style['transition'] = ''
				}, 1000)
			}

			gsap.killTweensOf(teacher)
			gsap.killTweensOf(student)
			gsap.killTweensOf(this.$refs.studyContent)

			if( this.zoomMode.enabled ) {
				let x1, x2, y = 0
				if(this.zoomMode.hideLeftBar) {
					x1 = 140
					x2 = 1015
					if(this.zoomMode.previewStudy) {
						y = 18
					} else {
						y = 160
					}
				} else {
					x1 = 444
					x2 = 1163
					if(this.zoomMode.previewStudy) {
						y = 18
					} else {
						y = 210
					}
				}
				
				gsap.to(teacher, speed, {x: x1, y: y, opacity:1, ease: Cubic.easeInOut, force3D: true})
				gsap.to(student, speed, {x: x2, y: y, opacity:1, ease: Cubic.easeInOut, force3D: true})
				if(speed > 0) {
					gsap.set(this.$refs.studyContent, {opacity:0})
					gsap.to(this.$refs.studyContent, 0.6, {opacity:1, delay: 0.3})
				}
				
			} else {
				gsap.to(teacher, speed, {x: 0, y: 0, ease: Cubic.easeInOut, force3D: true})
				gsap.to(student, speed, {x: 0, y: 247, ease: Cubic.easeInOut, force3D: true})
				if(speed > 0) {
					gsap.set(this.$refs.studyContent, {opacity:0})
					gsap.to(this.$refs.studyContent, 0.6, {opacity:1, delay: 0.8})
				}
			}

			if(this.isShareScreen) {
				JanusService.stopShareScreen()
				this.isShareScreen = false
			}
			this.studyWindow.onreceiveviewermessage({ name: 'zoom-mode',  value: this.zoomMode })
			
		},

		async onStartDice ( mode ) {
			if(mode === 'single') {
				this.$refs.diceView.start( mode )
			} else {
				if(this.userInfo.type === 'ST' && this.showDiceCount > 0) {
					this.showDiceCount = 0
					this.$refs.diceView.start( mode )
				} else {
					await this.sendJanusData('start-dice', '' )
				}
			}
		},

		async onStartBuzzer () {
			this.$refs.buzzerView.start()
			await this.sendJanusData('start-buzzer', '')
		},

		async onDropDice ( data ) {
			await this.sendJanusData('drop-dice', data )
		},

		async onStartHandGame ( handIdx ) {
			if(this.userInfo.type === this.currentOwner) {
				this.handIndex = handIdx
				await this.sendJanusData('start-hand-game', handIdx )
			} else if(this.userInfo.type === 'ST' && this.showHandCount > 0) {
				await this.sendJanusData('drop-hand-game', {hand1: this.handIndex, hand2: handIdx} )
			}
		},

		async onSTPermission ( type ) {
			await this.sendJanusData('st-permission', {type: type, value: !this.STPermissions[type]})
		},

		initStudyModule(first = false) {
			let classCode
			if(this.$ucodeToPart(this.studyInfo.ucode) === 'R') {
				classCode = 'RCK'
			} else {
				classCode = 'SC' + this.currentOwner.slice(0, -1)
				this.$store.dispatch('study/mainStudy/setStudyPages', [`${this.currentOwner.slice(0, -1)}0`, 0])
				this.$store.dispatch('study/mainStudy/setWhiteBoard', { historyUndo: [], historyRedo: [] })
				this.$refs.whiteBoard.init()
			}
			// this.studyLoaded = false
			console.log('initStudyModule', classCode)
			this.studyWindow.onreceiveviewermessage({
				name: 'init-modlue-main', 
				value: { 
					Ucode: this.studyInfo.ucode, 
					cls_code: classCode, 
					initData: this.studyInitData,
					studyMode: this.studyMode,
					pcd_seq: this.userInfo.pcd_seq,
					first: first,
					ot: this.studyInfo.otday
				}
			})
		},

		async onShowRanking ( noSend = false ) {
			const rankingView = this.$refs.rankingView
			if(!rankingView.isShow) {
				if(!noSend){
					await this.sendJanusData('ranking-view', { value: true })
				}
				const result = await this.$http.post(`${this.$config.LMSApiURL}/getTotalPoints`, { 
					pcd_seq: this.userInfo.pcd_seq,
					Ucode: this.studyInfo.ucode,
					mem_id: this.userInfo.id
				})
				result.data['Ranks'].forEach( list => {
					list.Mpoint = list.Mpoint ? parseInt(list.Mpoint) : 0
				})

				this.$store.dispatch('study/mainStudy/setClassMembers', result.data['Ranks'])
				rankingView.show()
			}
		},

		async onHideRanking ( noSend = false ) {
			const rankingView = this.$refs.rankingView
			if(!noSend) {
				await this.sendJanusData('ranking-view', { value: false })
			} else {
				rankingView.isShow = false
			}
		},

		onChangeVolume ( value ) {
			this.$refs.teacherVideo1.volume = value * 0.01
			this.$refs.teacherVideo2.volume = value * 0.01
			this.$refs.studentVideo.volume = value * 0.01
		},

		async onStudyFinish () {
			if(this.studyMode === 'study') {
				const isSave = await this.$http.post(`${this.$config.LMSApiURL}/getIsHwSave`, { 
					pcd_seq: this.userInfo.pcd_seq
				})
				if(isSave.data.ok) {
					this.$confirm({
						message: '오늘의 Main Class 수업을<br />완료로 저장하시겠습니까?',
						button: [{ name: '취소', value: false }, { name: '확인', value: true }],
						callback: async ( value ) => {
							if(value) {
								await this.$http.post(`${this.$config.LMSApiURL}/setPassedClass`, { 
									pcd_seq: this.userInfo.pcd_seq
								})
								await this.$http.post(`${this.$config.LMSApiURL}/setEndClass`, { 
									pcd_seq: this.userInfo.pcd_seq,
									user_type: 'KT'
								})
								await this.sendJanusData( 'main-class-finish', true )
							}
						}
					})
				} else {
					this.$confirm({
						message: '숙제가 저장되지 않았습니다.<br />숙제를 저장해 주세요.',
						button: [
							{ name: '확인'} 
						]
					})
				}
				
			} else {
				this.$confirm({
					message: '체험모드 수업을<br />종료 하시겠습니까?',
					button: [{ name: '취소', value: false }, { name: '확인', value: true }],
					callback: async ( value ) => {
						if(value) {
							await this.sendJanusData( 'main-class-finish', true )
						}
					}
				})
			}
		},

		onDeviceChange ( e ) {
			clearTimeout(this.timer)
			this.timer = setTimeout(async () => {
				this.$store.dispatch('study/mainStudy/setConfigs', { videoInput: '',  audioInput: '', audioOutput: ''})
				const deviceList = await JanusService.getDeviceLists()
				deviceList.forEach(( list ) => {
					if(list.kind === 'videoinput') {
						if(this.viewerConfigs.videoInput === '')  this.$store.dispatch('study/mainStudy/setConfigs', { videoInput: list.deviceId })
					} else if(list.kind === 'audioinput') {
						if(this.viewerConfigs.audioInput === '')  this.$store.dispatch('study/mainStudy/setConfigs', { audioInput: list.deviceId })
					} else {
						if(this.viewerConfigs.audioOutput === '') this.$store.dispatch('study/mainStudy/setConfigs', { audioOutput: list.deviceId })
					}
				})
				if(this.$refs.configPopup) {
					this.$refs.configPopup.changeDevice( deviceList )
				}
				JanusService.setInputDevice()
			}, 1000)
		},

		onCloseImageViewer () {
			this.homeworkPicData = { images: [], scrollY: 0 }
			this.sendJanusData('hmwk-off-pic', { show: false })
		},

		onScrollImageViewer ( scrollY ) {
			this.homeworkPicData.scrollY = scrollY
			this.sendJanusData('hmwk-off-pic', { scrollY: scrollY })
		},

		onLoadImageViewer () {
			this.$refs.imageViewer.updateScroll( this.homeworkPicData.scrollY )
		},

		onCloseTextViewer () {
			this.homeworkNoteData = { noteData: null, scrollY: 0 }
			this.sendJanusData('hmwk-off-note', { show: false })
		},

		onScrollTextViewer ( scrollY ) {
			this.homeworkNoteData.scrollY = scrollY
			this.sendJanusData('hmwk-off-note', { scrollY: scrollY })
		},

		onCloseStudyPointViewer ( checkList ) {
			this.studyWindow.onreceiveviewermessage({ name: 'hmwk-class-report', value: checkList })
			this.homeworkReportData= {
				show: false,
				sdl_ucode: '',
				hmwk_off_w: [[]],
				hmwk_off_s: [[]],
				hmwk_off_q: [[]],
				checkLists: {W: [], S: [], Q: []},
				tabIndex: 1,
				slideIndex: 1
			}
			this.sendJanusData('hmwk-class-report', { show: false })
		},

		onUpdateStudyPointViewer ( updateData ) {
			Object.assign(this.homeworkReportData, updateData)
			this.sendJanusData('hmwk-class-report', { updateData: updateData })
		},

		updatePoints () {
			if(this.studyMode === 'study') {
				return new Promise( async (resolve, reject) => {
					let result = await this.$http.post(`${this.$config.LMSApiURL}/getTotalPoints`, { 
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
					this.$store.dispatch('study/mainStudy/setClassMembers', result.data['Ranks'])
					
					resolve( result )
				})
			} else {
				this.$store.dispatch('setPointInfo', { 
					totalPoints: 0,
					preMonthPoints: 0,
					nowMonthPoints: 0,
					currntPoints: 0,
					prePoint: 0,
					mainPoint: 0,
					mainPointK: 0,
					mainPointF: 0,
					afterPoint: 0,
					homeworkOnPoint: 0,
					homeworkOffPoint: 0,
					prevMonthRank: 0
				})
			}
		},
		

		onTimeupdate ( now ) {
			
			if(this.studyStatus === 'onStudy') {
				let mainCount = now - this.studyInfo.classStartTime
				if(!mainCount) mainCount = 25 * 60 * 1000
				if(this.studyPart == 'S') {
					if(this.studyTime.current > 0) {
						if(this.firstTeature === 'K') {
							const ktEndTime = 10 * 60 * 1000
							this.studyTime.kt = this.studyTime.current
							if(this.studyTime.current > ktEndTime) {
								this.studyTime.ft = this.studyTime.current - ktEndTime
							}
						} else {
							const ftEndTime = 15 * 60 * 1000
							this.studyTime.ft = this.studyTime.current
							if(this.studyTime.current > ftEndTime) {
								this.studyTime.kt = this.studyTime.current - ftEndTime
							}
						}
					}
				}

				this.studyTime.current = mainCount

				let m, s
				if(this.studyPart == 'S') {
					if(this.currentOwner === 'KT'){
						m = parseInt(this.studyTime.kt/60/1000)
						s = parseInt(this.studyTime.kt/1000) % 60
					} else {
						m = parseInt(this.studyTime.ft/60/1000)
						s = parseInt(this.studyTime.ft/1000) % 60
					}

				} else {
					m = parseInt(this.studyTime.current/60/1000)
					s = parseInt(this.studyTime.current/1000) % 60
				}

				const minut = this.$addZero(Math.abs(m), 2)
				const second = this.$addZero(Math.abs(s), 2)
				this.mainCountTime = `${minut}:${second}`

			} else {
				this.mainCountTime = '00:00'
			}

			if(this.showDiceCount > 0) {
				this.showDiceCount -= 1/30
				if(this.showDiceCount <= 0)  {
					this.showDiceCount = 0
				}
			}

			if(this.showHandCount > 0) {
				this.showHandCount -= 1/30
				if(this.showHandCount <= 0)  {
					this.handIndex = 0
				}
			}
		}
	}
}
</script>

<style lang="scss">

@keyframes btn-active {
	0% {
		background-color: #caabb3;
	}
	50% {
		background-color: #fe84e0;
	}
	100% {
		background-color: #caabb3;
	}
}

#main-class{
	@include fullSize();
	box-sizing: border-box;
	padding: 0 27px 14px 30px;

	.viewer-container {
		position: relative;
		@include fullSize;
	}

	.viewer-header {
		position: relative;
		height: 103px;
		padding-left: 235px;
		box-sizing: border-box;
		.btn-con {
			@include displayFlex;
			float:right;
			padding-right:75px;
			padding-top: 10px;
			height: 100%;
			&.disable {
				pointer-events: none;
				opacity: 0.3;
			}
			div.btn {
				position: relative;
				@include displayFlex;
			}
			.round-btn {
				width: 55px;
				height: 55px;
				border-radius: 20px;	
				background-color: #caabb3;
				transition: background-color 0.3s;
				margin-left: 12px;
				vertical-align: middle;
				&.disable {
					pointer-events: none;
					opacity: 0.5;
				}
				&:hover,
				&.down,
				&.active {
					background-color: #ad737a;
					opacity: 1 !important;
				}
				&.ani {
					animation: btn-active 1s $cubic-ease-in-out infinite;
				}
			}
			.btn-group {
				@include displayFlex;
				margin-left: 12px;
				padding: 7px;
				border-radius: 25px;
				background-color: #dcd3c1;
			}
			.on-btn {
				width: 47px;
				height: 31px;
				border-radius: 15px;
				background-color: #9b84a8;
				color: #fff;
				font-weight: 500;
				font-size: 19px;
				margin-left: 3px;
				&.active {
					background-color: #e81a72;
				}
			}
			.btn-progress {
				position: absolute;
				top: 62px;
				height: 9px;
				background-color: #5e4b68;
				border-radius: 4px;
				overflow: hidden;
				.bar {
					display: block;
					width: 0%;
					height: 100%;
					background-color: #f173c0;
					border-radius: 4px;
				}
			}
			.hand-btns {
				position: relative;
				@include displayFlex;
			}
		}
	}

	.viewer-wrapper {
		position: relative;
		width: 100%;
		height: 963px;
		background-color: #fff;
		border-radius: 30px;
		overflow: hidden;
		box-shadow: 1px 1px 3px rgba(0,0,0,0.5);
	}

	.viewer-left {
		position: absolute;
		left:0;
		top:0;
		width: 300px;
		height: 100%;
		border-right: solid 1px gray;
		padding: 10px;
		box-sizing: border-box;
		background-color: #506077;
		transition: transform 1s $cubic-ease-in-out;
		z-index: 1;

		.top-menu {
			@include displayFlex(flex-end, flex-start);
			padding: 18px 3px;
			box-sizing: border-box;
			height:55px;
			margin-bottom: 497px;
			> .btn {
				margin: 0 8px;
			}
			.config-btn {
				width: 37px;
				height: 35px;
				background: url('~@/assets/images/study/config_icon.png') no-repeat;
			}
			.server-rec-btn{
				width: 45px;
				height: 35px;
				background: url('~@/assets/images/study/server_rec_icon.png') no-repeat;
				&.active {
					background-position-y: -35px;
				}
			}
			.permission-btn{
				width: 36px;
				height: 37px;
				background: url('~@/assets/images/study/permission_icon.png') no-repeat;
				&.active {
					background-position-y: -37px;
				}
			}
		}

		.message-con{
			width: 100%;
			height: 258px;
			> ul {
				width: 100%;
				height: 205px;
				overflow-y: auto;
				padding: 0 10px;
				box-sizing: border-box;
				margin-bottom: 10px;
				@include underline();
				> li {
					position: relative;
					display: block;
					margin: 5px 0;
					overflow-wrap: break-word;
					color: #333;
					&.me{
						font-weight: bold;
						color: #000
					}
					em{
						font-style: normal;
						font-weight: normal;
						font-size: 12px;
					}
				}
			}
		}

	}

	.video-con {
		position: absolute;
		left: 10px;
    	top: 65px;
		width: 280px;
		height: 490px;
		z-index: 100;
		> div {
			position: absolute;
			left: 0;
			top: 0;
			width: 90px;
			height: 69px;
			box-sizing: border-box;
			transition: width 1s, height 1s;
			transition-timing-function: $cubic-ease-in-out;
			background-color: #2a3c42;
			// overflow: hidden;
			border-radius: 8px;
			z-index: 110;
			will-change: transform;
			border: solid 3px #2a3c42;
			&.no-join {
				background: url('~@/assets/images/study/no_join_icon.png') no-repeat center #2a3c42;
				background-size: contain;
			}
			&.no-video {
				background: url('~@/assets/images/study/no_video_icon.png') no-repeat center #2a3c42;
				background-size: contain;
			}
			> video {
				width: 100%;
				height: 100%;
				object-fit: cover;
				border-radius: 8px;
			}
			.mic-btn {
				position: absolute;
				right: 5px;
				bottom: 5px;
			}
			.report-btn {
				position: absolute;
				right: -40px;
    			bottom: -5px;
				display: inline-block;
				width: 31px;
				height: 33px;
				background: url('~@/assets/images/study/report_btn.png') no-repeat;
				&:hover,
				&.down {
					background-position-y: -33px;
				}
			}
			&:before {
				position: absolute;
				left: 3px;
				top: 3px;
				content: '';
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
		}

		.teacher-con1:before{
			content: 'K';
    		background-color: #0071bc;
		}
		.teacher-con2:before{
			content: 'F';
   	 	background-color: #fb723b;
		}
    
		.teacher-con1.disable,
		.teacher-con2.disable {
			width: 280px;
			height: 210px;
			border: none;
			pointer-events: none;
			&:before {
				left: 6px;
				top: 6px;
			}
			.report-btn {
				display: none;
			}
		}

		.student-con {
			width: 280px;
			height: 210px;
			z-index: 100;
			border: none;
			&:before {
				content: 'S';
    			background-color: #42b63b;
				left: 6px;
				top: 6px;
			}
		}

		.name {
			position: absolute;
			left: 0;
			width: 100%;
			height: 38px;
			line-height: 38px;
			color: #fff;
			padding-left: 15px;
			font-family: 'nq';
			font-weight: 500;
			font-size: 19px;
			text-shadow: 1px 1px 1px #2a3c42;
			transition: transform 1s $cubic-ease-in-out;
			&.teacher {
				top: 210px;
			}
			&.student {
				top: 458px;
			}
			&:before {
				content:'';
				display: inline-block;
				width: 10px;
				height: 10px;
				position: absolute;
				left: 0;
				top: 13px;
				background-color: #fff;
				border-radius: 50%;
				box-shadow: 1px 1px 1px #2a3c42;
			}
		}
	}
	

	.viewer-right {
		position: relative;
		padding-left: 300px;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}

	.viewer-content {
		position:relative;
		height: 100%;

		.content-wrap {
			position: relative;
			height: 100%;
			width: 100%;
			transition: height 1s $cubic-ease-in-out;
			@include displayFlex;
			&.disable {
				pointer-events: none;
			}
		}

		.screen-share-con {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background-color: #fff;
			> video {
				width: 100%;
				height: 100%;
			}
		}

		.viewer-menu {
			position: absolute;
			right: 28px;
			top: 12px;
			z-index: 9;
			@include displayFlex;
			&.disable {
				pointer-events: none;
			}
			.st-permission {
				width: 137px;
				height: 51px;
				background: url('~@/assets/images/study/st_permission_bg.png') no-repeat;
				padding:5px 0 0 52px;
				.st-activity-btn {
					display: inline-block;
					width: 34px;
					height: 36px;
					background: url('~@/assets/images/study/st_activity_btn.png') no-repeat;
					vertical-align: middle;
				}
				.st-board-btn {
					display: inline-block;
					width: 27px;
					height: 33px;
					background: url('~@/assets/images/study/st_board_btn.png') no-repeat;
					vertical-align: middle;
					margin-left: 5px;
				}
				.btn.active {
					background-position-y: 100%;
				}
				&.disable {
					pointer-events: none;
					opacity: 0.3;
				}
			}	
			.line {
				width: 3px;
				height: 48px;
				background-color: #e5e4e4;
				margin: 0 20px;
			}

			.finish-btn {
				width: 35px;
				height: 42px;
				background: url('~@/assets/images/study/finish_btn.png') no-repeat;
			}

			.zoom-btn {
				width: 46px;
				height: 39px;
				background: url('~@/assets/images/study/zoom_btn.png') no-repeat;
			}

			.share-btn {
				width: 46px;
				height: 40px;
				background: url('~@/assets/images/study/share_btn.png') no-repeat;
			}

			.local-rec-btn {
				width: 47px;
				height: 37px;
				background: url('~@/assets/images/study/rec_btn.png') no-repeat;
			}

			.ico-btn {
				display: inline-block;
				&.down,
				&.active {
					background-position-y: 100%;
				}
				&.disable {
					pointer-events: none;
					opacity: 0.3;
				}
			}

			.count-time {
				font-size: 38px;
				font-weight: 600;
				margin-left: 20px;
				position: relative;
				top: 3px;
			}
			
		}

		.blind-con {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(255, 255, 255, 0.3);
			border-top-right-radius: 30px;
			border-bottom-right-radius: 30px;
		}

		.loading-con {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background-color: #fff;
			border-top-right-radius: 30px;
			border-bottom-right-radius: 30px;
			z-index: 99;
			@include displayFlex;
			> div {
				font-size: 40px;
				font-weight: 600;
				text-align: center;
			}
		}

		.zoom-mode-con {
			position: absolute;
			right: 70px;
			bottom: 50px;
			label {
				display: block;
				font-size: 25px;
				font-weight: 500;
				margin: 5px 0;
			}
			input {
				display: none;
				width: 37px;
				height: 36px;
			}
			.check-icon {
				display: inline-block;
				width: 37px;
				height: 36px;
				vertical-align: middle;
				background: url('~@/assets/images/study/check_small.png') no-repeat;
			}
			input:checked ~.check-icon {
				background-position-y: -36px;
			}
		}
	}

	.board-btn {
		position: absolute;
		right: -18px;
		bottom: 0;
		width: 53px;
		height: 61px;
		background: url('~@/assets/images/study/board_btn.png') no-repeat;
		z-index: 100;
		&:hover,
		&.down {
			background-position-y: -61px;
		}
		&.active {
			background-position-y: -122px;
		}
	}

	.viewer-container.zoom-mode {
		
		.video-con {
			.teacher-con1.disable,
			.teacher-con2.disable,
			.student-con {
				width: 535px !important;
				height: 401px !important;
			}
			.teacher-con1:not(.disable),
			.teacher-con2:not(.disable) {
				display: none;
			}
		}
	}

	.viewer-container.zoom-mode.hide-left-bar {
		.viewer-left {
			transform: translateX(-300px);
		}
		.viewer-right {
			padding-left: 0;
		}
		.video-con {
			.teacher-con1.disable,
			.teacher-con2.disable,
			.student-con {
				width: 686px !important;
				height: 514px !important;
			}
			.name {
				transform: translateX(-300px);
			}
		}
	}

	.viewer-container.zoom-mode:not(.preview-study) {
		.viewer-right .content-wrap {
			display: none;
		}
	}

}
</style>