<template>
	<div id="study-table">
		
		<div class="table-wrap" v-if="dataLoaded">
			<smooth-scrollbar ref="scrollBar">
				<!-- reading -->
				<div v-if="!no_data_R && data_R.is_atest === 0" v-show="tabIndex === 1" class="table-view reading">

					<!-- top-title -->
					<div class="top-title">
						<h4 class="tit" v-html="readingTitle" />
						<div class="date">
							{{data_R.sdl_dt.split(' ')[0]}} <em>{{days[new Date(data_R.sdl_dt.replace(/-/g, "/")).getDay()]}}</em>
						</div>
					</div>
					<!-- //top-title -->

					<!-- table-list -->
					<div class="table-list">
						<div class="title">
							<span>Self<br />Check</span>
							<span>Teacher<br />’s Check</span>
						</div>
						<ui-button class="study-point-btn" 
							@button:click="onStudyPoint('R')">
							<img src="~@/assets/images/myself/pen_icon.png" />학습요점
						</ui-button>
						<table>
							<colgroup>
								<col style="width:140px;">
								<col style="">
								<col style="width:140px;">
								<col style="width:140px;">
							</colgroup>
							<tbody>
								<tr>
									<td class="tit center"><div>On</div></td>
									<td>{{data_R.hmwk_on[0]}}</td>
									<td class="center bl">
										<label>
											<input type="checkbox" 
												v-model="selfCheckR[0]" 
												@change="onCheck('R', 'hmwk_on', selfCheckR[0])">
											<span></span>
										</label>
									</td>
									<td class="center bl">
										<label class="disabled">
											<input type="checkbox" 
												:checked="teacherCheckR[0]">
											<span></span>
										</label>
									</td>
								</tr>
							</tbody>
						</table>
						<table>
							<colgroup>
								<col style="width:140px;">
								<col style="width:240px;">
								<col style="">
								<col style="width:140px;">
								<col style="width:140px;">
							</colgroup>  
							<tbody>  
								<tr>
									<td class="tit center" rowspan="5"><div>Off</div></td>
									<td class="center" rowspan="3"><strong>쓰기 및 암기</strong></td>
									<td class="bl">
										<div v-if="data_R.hmwk_off_w[1]">
											<span class="check active1"></span>체크된 words {{data_R.hmwk_off_w[1]}}번 쓰면서 말하기
										</div>
									</td>
									<td class="center bl">
										<label v-if="data_R.hmwk_off_w[1]">
											<input type="checkbox" 
												v-model="selfCheckR[1]"
												@change="onCheck('R', 'hmwk_off_W', selfCheckR[1])">
											<span></span>
										</label>
									</td>
									<td class="center bl">
										<label class="disabled" v-if="data_R.hmwk_off_w[1]">
											<input type="checkbox" 
												:checked="teacherCheckR[1]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="bl bt">
										<div v-if="data_R.hmwk_off_s[1]">
											<span class="check active1"></span>체크된 story {{data_R.hmwk_off_s[1]}}번 쓰면서 말하기
										</div>
									</td>
									<td class="center bl bt">
										<label v-if="data_R.hmwk_off_s[1]">
											<input type="checkbox" 
												v-model="selfCheckR[2]"
												@change="onCheck('R', 'hmwk_off_S', selfCheckR[2])">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_R.hmwk_off_s[1]">
											<input type="checkbox" 
												:checked="teacherCheckR[2]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="bl bt">
										<div v-if="data_R.hmwk_off_q[1]">
											<span class="check active2"></span>체크된 words {{data_R.hmwk_off_q[1]}}번 쓰고 암기하기 : Quiz 준비
										</div>
									</td>
									<td class="center bl bt">
										<label v-if="data_R.hmwk_off_q[1]">
											<input type="checkbox" 
												v-model="selfCheckR[3]"
												@change="onCheck('R', 'hmwk_off_Q', selfCheckR[3])">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_R.hmwk_off_q[1]">
											<input type="checkbox" 
												:checked="teacherCheckR[3]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="center bt" rowspan="2"><strong>개인 숙제</strong></td>
									<td class="bl bt">{{data_R.hmwk_off_custum[0] && data_R.hmwk_off_custum[0][0] ? data_R.hmwk_off_custum[0][0] : ''}}</td>
									<td class="center bl bt">
										<label v-if="data_R.hmwk_off_custum[0] && data_R.hmwk_off_custum[0][0]">
											<input type="checkbox" 
												v-model="selfCheckR[4]"
												@change="onCheck('R', 'hmwk_off_custom', selfCheckR[4])">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_R.hmwk_off_custum[0] && data_R.hmwk_off_custum[0][0]">
											<input 
												type="checkbox" 
												:checked="teacherCheckR[4]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="bl bt">{{data_R.hmwk_off_custum[1] && data_R.hmwk_off_custum[1][0] ? data_R.hmwk_off_custum[1][0] : ''}}</td>
									<td class="center bl bt">
										<label v-if="data_R.hmwk_off_custum[1] && data_R.hmwk_off_custum[1][0]">
											<input type="checkbox" 
												v-model="selfCheckR[5]"
												@change="onCheck('R', 'hmwk_off_custom', selfCheckR[5], 1)">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_R.hmwk_off_custum[1] && data_R.hmwk_off_custum[1][0]">
											<input 
												type="checkbox" 
												:checked="teacherCheckR[5]">
											<span></span>
										</label>
									</td>
								</tr>
							</tbody>
						</table>
						<table class="my-plane">
							<colgroup>
								<col style="width:380px;">
								<col style="">
								<col style="width:140px;">
								<col style="width:140px;">
							</colgroup>
							<tbody>
								<tr>
									<td class="tit center" rowspan="2"><div>자기주도계획</div></td>
									<td>{{data_R.self_plan[0] && data_R.self_plan[0][0] ? data_R.self_plan[0][0] : ''}}</td>
									<td class="center bl">
										<label v-if="data_R.self_plan[0] && data_R.self_plan[0][0]">
											<input type="checkbox" 
												v-model="selfCheckR[6]"
												@change="onCheck('R', 'self_plan', selfCheckR[6])">
											<span></span>
										</label>
									</td>
									<td class="center bl">
										<label class="disabled" v-if="data_R.self_plan[0] && data_R.self_plan[0][0]">
											<input 
												type="checkbox" 
												:checked="teacherCheckR[6]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="bt">{{data_R.self_plan[1] && data_R.self_plan[1][0] ? data_R.self_plan[1][0] : ''}}</td>
									<td class="center bl bt">
										<label v-if="data_R.self_plan[1] && data_R.self_plan[1][0]">
											<input type="checkbox" 
												v-model="selfCheckR[7]"
												@change="onCheck('R', 'self_plan2', selfCheckR[7], 1)">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_R.self_plan[1] && data_R.self_plan[1][0]">
											<input v-if="data_R.self_plan[1] && data_R.self_plan[1][0]" 
												type="checkbox" 
												:checked="teacherCheckR[7]">
											<span></span>
										</label>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<!-- //table-list -->

					<!-- t-comment -->
					<!-- <div class="t-comment">
						<div class="title">Teacher’s Comment</div>
						<div class="comment" 
							v-if="data_R.tch_comment" 
							v-html="data_R.tch_comment.replace(/(?:\r\n|\r|\n)/g, '<br>')" />
					</div> -->
					<!-- //t-comment -->

					<div style="height: 80px"></div>

				</div>
				<!-- //reading -->

				<!-- speaking -->
				<div v-if="!no_data_S && data_S.is_atest === 0" v-show="tabIndex === 2" class="table-view speaking">
					<!-- top-title -->
					<div class="top-title">
						<h4 class="tit" v-html="speakingTitle" />
						<div class="date">
							{{data_S.sdl_dt.split(' ')[0]}} <em>{{days[new Date(data_S.sdl_dt.replace(/-/g, "/")).getDay()]}}</em>
						</div>
					</div>
					<!-- //top-title -->

					<!-- table-list -->
					<div class="table-list">
						<div class="title">
							<span>Self<br />Check</span>
							<span>Teacher<br />’s Check</span>
						</div>
						<ui-button class="study-point-btn" 
							@button:click="onStudyPoint('S')">
							<img src="~@/assets/images/myself/pen_icon.png" />학습요점
						</ui-button>
						<table>
							<colgroup>
								<col style="width:140px;">
								<col style="width:240px;">
								<col style="">
								<col style="width:140px;">
								<col style="width:140px;">
							</colgroup>
							<tbody>
								<tr>
									<td class="tit center" rowspan="5"><div>Off</div></td>
									<td class="center" rowspan="3"><strong>쓰기 및 암기</strong></td>
									<td class="bl">
										<div v-if="data_S.hmwk_off_w[1]">
											<span class="check active1"></span>체크된 words {{data_S.hmwk_off_w[1]}}번 쓰면서 말하기
										</div>
									</td>
									<td class="center bl">
										<label v-if="data_S.hmwk_off_w[1]">
											<input type="checkbox" 
												v-model="selfCheckS[0]"
												@change="onCheck('S', 'hmwk_off_W', selfCheckS[0])">
											<span></span>
										</label>
									</td>
									<td class="center bl">
										<label class="disabled" v-if="data_S.hmwk_off_w[1]">
											<input type="checkbox" 
												:checked="teacherCheckS[0]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="bl bt">
										<div v-if="data_S.hmwk_off_s[1]">
											<span class="check active1"></span>체크된 conversation {{data_S.hmwk_off_s[1]}}번 쓰면서 말하기
										</div>
									</td>
									<td class="center bl bt">
										<label v-if="data_S.hmwk_off_s[1]">
											<input type="checkbox" 
												v-model="selfCheckS[1]"
												@change="onCheck('S', 'hmwk_off_S', selfCheckS[1])">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_S.hmwk_off_s[1]">
											<input type="checkbox" 
												:checked="teacherCheckS[1]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="bl bt">
										<div v-if="data_S.hmwk_off_q[1]">
											<span class="check active2"></span>체크된 words {{data_S.hmwk_off_q[1]}}번 쓰고 암기하기 : Quiz 준비
										</div>
									</td>
									<td class="center bl bt">
										<label v-if="data_S.hmwk_off_q[1]">
											<input type="checkbox" 
												v-model="selfCheckS[2]"
												@change="onCheck('S', 'hmwk_off_Q', selfCheckS[2])">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_S.hmwk_off_q[1]">
											<input type="checkbox" 
												:checked="teacherCheckS[2]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="center bt" rowspan="2"><strong>개인 숙제</strong></td>
									<td class="bl bt">{{data_S.hmwk_off_custum[0] && data_S.hmwk_off_custum[0][0] ? data_S.hmwk_off_custum[0][0] : ''}}</td>
									<td class="center bl bt">
										<label v-if="data_S.hmwk_off_custum[0] && data_S.hmwk_off_custum[0][0]">
											<input type="checkbox" 
												v-model="selfCheckS[3]"
												@change="onCheck('S', 'hmwk_off_custum', selfCheckS[3])">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_S.hmwk_off_custum[0] && data_S.hmwk_off_custum[0][0]">
											<input 
												type="checkbox" 
												:checked="teacherCheckS[3]">
											<span></span>
										</label>
									</td>
								</tr>
								<tr>
									<td class="bl bt">{{data_S.hmwk_off_custum[1] && data_S.hmwk_off_custum[1][0] ? data_S.hmwk_off_custum[1][0] : ''}}</td>
									<td class="center bl bt">
										<label v-if="data_S.hmwk_off_custum[1] && data_S.hmwk_off_custum[1][0]">
											<input type="checkbox" 
												v-model="selfCheckS[4]"
												@change="onCheck('S', 'hmwk_off_custum', selfCheckS[4], 1)">
											<span></span>
										</label>
									</td>
									<td class="center bl bt">
										<label class="disabled" v-if="data_S.hmwk_off_custum[1] && data_S.hmwk_off_custum[1][0]">
											<input 
												type="checkbox" 
												:checked="teacherCheckS[4]">
											<span></span>
										</label>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<!-- //table-list -->

				</div>
				<!-- speaking -->

				<div v-show="(tabIndex === 1 && no_data_R && !data_R.is_atest) || (tabIndex === 2 && no_data_S && !data_S.is_atest)" class="table-view no-data">
					등록된 내용이 없습니다.
				</div>

				<div v-show="(tabIndex === 1 && data_R.is_atest === 1) || (tabIndex === 2 && data_S.is_atest === 1)" class="table-view no-data">
					오늘은 A-Test day 입니다.<br />오늘의 숙제는 없으며, A-Test 결과는 추후에 발송됩니다.
				</div>
			</smooth-scrollbar>
		</div>

		<div class="part-tab" :class="`active${tabIndex}`">
			<ui-tab-menu
				ref="tabMenu"
				:active-index="tabIndex"
				@tabmenu:change="onChangeTab">
				<ui-button>Reading</ui-button>
				<ui-button>Speaking</ui-button>
			</ui-tab-menu>
		</div>

		<myself-header 
			titleImg="study_table_title.png" 
			titleTxt="자기주도학습표" />

		<study-point-viewer ref="studyPointViewer"
			:init-data="viewerData"
			:part="viewerPart" />
	</div>
</template>

<script>

import StudyPointViewer from '@/components/myself/StudyPointViewer'
import MyselfHeader from '@/components/myself/MyselfHeader'

export default {
	
	name: 'studyTable',

	components: {
		StudyPointViewer,
		MyselfHeader
	},

	data () {
		return {
			tabIndex: 1,
			data_R: {
				hmwk_on: ['', 0, 0],
				hmwk_off_w: [[], 0, 0, 0],
				hmwk_off_s: [[], 0, 0, 0],
				hmwk_off_q: [[], 0, 0, 0],
				hmwk_off_custum: [],
				self_plan: [],
				tch_comment: '',
				is_atest: 0
			},
			data_S: {
				hmwk_off_w: [[], 0, 0, 0],
				hmwk_off_s: [[], 0, 0, 0],
				hmwk_off_q: [[], 0, 0, 0],
				hmwk_off_custum: [],
				is_atest: 0
			},
			no_data_R: false,
			no_data_S: false,
			dataLoaded: false,
			days: ['Sun', 'Mon', 'Tue', 'Wed','Thu', 'Fri', 'Sat'],

			selfCheckR: [],
			selfCheckS: [],

			teacherCheckR: [],
			teacherCheckS: [],

			viewerData: null,
			viewerPart: 'R'
		}
	},

	computed: {

		pcd_R () {
			const hmwkOffR = this.$store.getters['myself/getHomeworkSdlInfo'].R
			return hmwkOffR ? hmwkOffR : null
		},

		pcd_S () {
			const hmwkOffS = this.$store.getters['myself/getHomeworkSdlInfo'].S
			return hmwkOffS ? hmwkOffS : null
		},

		latestHmwkOff () {
			return this.$store.getters['myself/getLatestHomeworkOff']
		},
		
		
		readingTitle () {
			const level = this.$ucodeToLevel(this.data_R.sdl_ucode)
			const part = this.$ucodeToPart(this.data_R.sdl_ucode)
			const day = this.$ucodeToDay(this.data_R.sdl_ucode)
			return `${level}${part}-Day${day} <span>[ ${LM.returnBookCode(level, part, day).replace('_', ' ')} ]</span>`
		},
		
		speakingTitle () {
			const level = this.$ucodeToLevel(this.data_S.sdl_ucode)
			const part = this.$ucodeToPart(this.data_S.sdl_ucode)
			const day = this.$ucodeToDay(this.data_S.sdl_ucode)
			return `${level}${part}-Day${day} <span>[ ${LM.returnBookCode(level, part, day).replace('_', ' ').replace('_', ' ').replace('_', ' ~ ')} ]</span>`
		}
	},

	async mounted () {
		// 학생이 아니면 error처리
		if(!this.userInfo.id || this.userInfo.type !== 'ST'){
			this.$router.push({name: 'Error'})
			return
		}
		let result
		// homeworkOff ucode가 없을 경우
		if( !this.latestHmwkOff ) {
			result = await this.$http.post(`${this.$config.LMSApiURL}/getHmwkMain`, { 
				pcd_seq: this.userInfo.pcd_seq,
				mem_id: this.userInfo.id 
			})
			
			this.$store.dispatch('myself/setHomeworkOffInfo', result.data['RS_hmwk_off'])
			this.$store.dispatch('myself/setHomeworkSdlInfo', {R: result.data['sdl_pcdR'], S: result.data['sdl_pcdS']})
		}

		if(this.pcd_R) {
			result = await this.$http.post(`${this.$config.LMSApiURL}/getHmwkReport`, { 
				pcd_seq: this.pcd_R,
				part : "R",
				mem_id: this.userInfo.id
			})

			if(!result.data.fail) {
				
				for (const [key, value] of Object.entries( result.data )) {
					try {
						this.data_R[key] = JSON.parse(value)
					} catch( e ){
						this.data_R[key] = value
					}
				}

				this.selfCheckR[0] = this.data_R.hmwk_on[1] === 1 ? true : false
				this.selfCheckR[1] = this.data_R.hmwk_off_w[2] === 1 ? true : false
				this.selfCheckR[2] = this.data_R.hmwk_off_s[2] === 1 ? true : false
				this.selfCheckR[3] = this.data_R.hmwk_off_q[2] === 1 ? true : false

				this.teacherCheckR[0] = this.data_R.hmwk_on[2] === 1 ? true : false
				this.teacherCheckR[1] = this.data_R.hmwk_off_w[3] === 1 ? true : false
				this.teacherCheckR[2] = this.data_R.hmwk_off_s[3] === 1 ? true : false
				this.teacherCheckR[3] = this.data_R.hmwk_off_q[3] === 1 ? true : false
				
				if(this.data_R.hmwk_off_custum && this.data_R.hmwk_off_custum[0]) {
					this.selfCheckR[4] = this.data_R.hmwk_off_custum[0][1] === 1 ? true : false
					this.teacherCheckR[4] = this.data_R.hmwk_off_custum[0][2] === 1 ? true : false
				}
				if(this.data_R.hmwk_off_custum && this.data_R.hmwk_off_custum[1]) {
					this.selfCheckR[5] = this.data_R.hmwk_off_custum[1][1] === 1 ? true : false
					this.teacherCheckR[5] = this.data_R.hmwk_off_custum[1][2] === 1 ? true : false
				}

				if(this.data_R.self_plan && this.data_R.self_plan[0]) {
					this.selfCheckR[6] = this.data_R.self_plan[0][1] === 1 ? true : false
					this.teacherCheckR[6] = this.data_R.self_plan[0][2] === 1 ? true : false
				}
				if(this.data_R.self_plan && this.data_R.self_plan[1]) {
					this.selfCheckR[7] = this.data_R.self_plan[1][1] === 1 ? true : false
					this.teacherCheckR[7] = this.data_R.self_plan[1][2] === 1 ? true : false
				}
			} else {
				this.data_R.is_atest = result.data.is_atest
				this.no_data_R = true
			}
		} else {
			this.no_data_R = true
		}
		
		
		if(this.pcd_S) {

			result = await this.$http.post(`${this.$config.LMSApiURL}/getHmwkReport`, { 
				pcd_seq: this.pcd_S,
				part : "S",
				mem_id: this.userInfo.id
			})

			if(!result.data.fail) {
				for (const [key, value] of Object.entries( result.data )) {
					try {
						this.data_S[key] = JSON.parse(value)
					} catch( e ){
						this.data_S[key] = value
					}
				}

				if(this.data_S.hmwk_off_w) this.selfCheckS[0] = this.data_S.hmwk_off_w[2] === 1 ? true : false
				if(this.data_S.hmwk_off_s) this.selfCheckS[1] = this.data_S.hmwk_off_s[2] === 1 ? true : false
				if(this.data_S.hmwk_off_q) this.selfCheckS[2] = this.data_S.hmwk_off_q[2] === 1 ? true : false

				if(this.data_S.hmwk_off_w) this.teacherCheckS[0] = this.data_S.hmwk_off_w[3] === 1 ? true : false
				if(this.data_S.hmwk_off_s) this.teacherCheckS[1] = this.data_S.hmwk_off_s[3] === 1 ? true : false
				if(this.data_S.hmwk_off_q) this.teacherCheckS[2] = this.data_S.hmwk_off_q[3] === 1 ? true : false

				if(this.data_S.hmwk_off_custum && this.data_S.hmwk_off_custum[0]) {
					this.selfCheckS[3] = this.data_S.hmwk_off_custum[0][1] === 1 ? true : false
					this.teacherCheckS[3] = this.data_S.hmwk_off_custum[0][2] === 1 ? true : false
				}
				if(this.data_S.hmwk_off_custum && this.data_S.hmwk_off_custum[1]) {
					this.selfCheckS[4] = this.data_S.hmwk_off_custum[1][1] === 1 ? true : false
					this.teacherCheckS[4] = this.data_S.hmwk_off_custum[1][2] === 1 ? true : false
				}
			} else {
				this.data_S.is_atest = result.data.is_atest
				this.no_data_S = true
			}
		} else {
			this.no_data_S = true
		}


		this.dataLoaded = true

	},

	methods: {
		onChangeTab ( idx ) {
			this.tabIndex = idx
			setTimeout(() => {
				this.$refs.scrollBar.scrollbar.update()
			})
		},

		async onCheck(part, keyName, value, index = 0) {
			let pcd = part === 'R' ? this.pcd_R : this.pcd_S
			await this.$http.post(`${this.$config.LMSApiURL}/setReportCheck`, { 
				pcd_seq: pcd,
				key_name: keyName,
				target: 'stu',
				index : index,
				value: value ? 1 : 0
			})
		},

		onStudyPoint ( part ) {
			this.viewerData = part === 'R' ? this.data_R : this.data_S
			this.viewerPart = part
			this.$refs.studyPointViewer.show = true
		}
	}
}
</script>

<style lang="scss">
#study-table{
	@include fullSize();
	.table-wrap {
		width: 100%;
		height: 100%;
		margin: 0 auto;
		padding-top: 220px;
		overflow: hidden;
		> div {
			padding: 0 60px;
			margin-top: 10px;
			height: calc(100% - 20px);
			overflow: visible !important;
		}
	}

	.table-view {
		
		.top-title {
			@include displayFlex(center, flex-start);
			padding: 70px 0 40px 0;
			.tit {
				font-size: 56px;
				font-weight: 600;
				> span {
					font-size: 40px;
					font-weight: 500;
					vertical-align: middle;
				}
			}
			.date {
				width: 319px;
				height: 48px;
				border-radius: 24px;
				margin-left: 20px;
				background-color: #bbe7f0;
				font-weight: 600;
				font-size: 32px;
				text-align: center;
				line-height: 46px;
				em {
					font-weight: 500;
				}
			}
		}
		.table-list {
			position: relative;
			.title {
				> span {
					position: absolute;
					top: -128px;
					width: 132px;
					height: 116px;
					text-align: center;
					background: url('~@/assets/images/myself/check_point_bg.png') no-repeat;
					font-size: 28px;
					color: #fff;
					font-weight: 600;
					padding-bottom: 15px;
					@include displayFlex;
					&:nth-child(1) {
						right: 145px;
					}
					&:nth-child(2) {
						right: 5px;
					}
				}
			}

			table {
				width: 100%;
				margin-bottom: 10px;
				border-radius: 10px;
				overflow: hidden;
				box-shadow: 0px 4px 5px rgba(0,0,0,0.1);
				td {
					padding: 0 35px;
					height: 80px;
					vertical-align: middle;
					background-color: #fff;
					font-size: 32px;
					font-weight: 400;
					&.tit {
						padding: 0;
						> div {
							width: 100%;
							height: 100%;
							background-color: #b2e1eb;
							border-radius: 10px;
							@include displayFlex;
							font-weight: 600;
						}
					}
					&.center {
						text-align: center;
					}
					&.bl {
						border-left: solid 2px #eee;
					}
					&.bt {
						border-top: solid 2px #eee;
					}
					strong{
						font-weight: 600;
					}
					label {
						position: relative;
						cursor: pointer;
						input[type='checkbox'] {
							width: 48px;
							height: 48px;
							opacity: 0;
							vertical-align: top;
						}
						span {
							position: absolute;
							left: 0; 
							top: 0;
							display: inline-block;
							width: 48px;
							height: 48px;
							background: url('~@/assets/images/common/checkbox.png') no-repeat;
						}
						input[type='checkbox']:checked + span {
							background-position-y: -48px;
						}
						&.disabled {
							pointer-events: none;
						}
						&.disabled input[type='checkbox'] + span {
							background-position-y: -96px;
						}
						&.disabled input[type='checkbox']:checked + span {
							background-position-y: -144px;
						}
					}
					.check {
						display: inline-block;
						width: 32px;
						height: 32px;
						vertical-align: middle;
						margin-right: 15px;
						background: url("~@/assets/images/myself/check_box.png") no-repeat;
						&.active1 {
							background-position-y: -32px;
						}
						&.active2 {
							background-position-y: -64px;
						}
					}
				}
			}
		}
		
		.study-point-btn {
			position: absolute;
			top: -112px;
    		right: 318px;
			width: 239px;
			height: 72px;
			font-size: 32px;
			font-weight: 600;
			z-index: 3;
			box-shadow: 4px 4px 1px rgba(0,0,0,0.15);
			background-color: #00bfe6;
			color: #fff;
			border-radius: 35px;
			> img {
				margin-right: 15px;
				vertical-align: bottom;
			}
		}

		&.no-data {
			@include displayFlex;
			width: 100%;
			height: 660px;
			font-size: 32px;
			font-weight: 500;
			border-radius: 40px;
			background-color: #fff;
			margin-top: 90px;
			text-align: center;
			line-height: 50px;
		}
	}

	.t-comment {
		position: relative;
		margin-top: 60px;
		width: 100%;
		height: 348px;
		background: url('~@/assets/images/myself/teacher_comment_bg.png') no-repeat;
		.title {
			position: absolute;
			left: 444px;
    		top: 42px;
			font-size: 32px;
			font-weight: 600;
			color: #fff;
		}
		.comment {
			position: absolute;
			left: 384px;
			top: 107px;
			width: 1240px;
			height: 192px;
			padding: 21px 30px;
			font-size: 32px;
			font-weight: 400;
			line-height: 75px;
			overflow-y: auto;
		}
	}


	.part-tab {
		position: absolute;
		left: -50%;
		top: 110px;
		width: 200%;
		z-index: 3;
		.tab-menu {
			width: 1830px;
    		margin: 0 auto;
			text-align: right;
			.btn {
				width: 424px;
				height: 100px;
				background: url('~@/assets/images/myself/rs_tab_bg.png') no-repeat;
				color: #a8dc80;
				font-size: 40px;
				font-weight: 600;
				transition: color 0.3s;
				&.active {
					color: #fff !important;
				}
				&:hover,
				&.down {
					color: #fff !important;
				}
			}
			.btn:nth-child(1) {
				color: #74c7aa;
				background-position-y: -100px;
			}
			.btn:nth-child(2) {
				color: #a8dc80;
			}
		}
		&:after {
			position: absolute;
			left: 0;
			top: 98px;
			width: 100%;
			content: '';
			height: 13px;
		}
		&.active1:after {
			background-color: #00ab7c;
		}
		&.active2:after {
			background-color: #78cc25;
		}
	}
	
}
</style>