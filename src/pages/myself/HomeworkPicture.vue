<template>
	<div id="homework-picture">

		<!-- content-list -->
		<div class="content-list">

			<smooth-scrollbar ref="scrollBar">
				<div class="top-title">
					<ui-button
						type="a" 
						:class="['week-btn', weekActive ? 'active': '']"
						@button:click="onSearchList('week')">
						최근 1주일
					</ui-button>
					<ui-button 
						type="a" 
						:class="['month-btn', monthActive ? 'active': '']"
						@button:click="onSearchList('month')">
						최근 1개월
					</ui-button>

					<datepicker ref="startDate" 
						class="start-date"
						:language="ko"  
						v-model="startDate"
						format="yyyy-MM-dd"
						:disabled-dates="disableStartDate">
					</datepicker>

					<datepicker ref="endDate" 
						class="end-date"
						:language="ko" 
						v-model="endDate"
						format="yyyy-MM-dd"
						:disabled-dates="disableEndDate">
					</datepicker>
					
					<ui-button 
						class="date-search-btn"
						@button:click="onSearchList('calendar')">
						<img src="~@/assets/images/common/search_icon_white.png" />
					</ui-button>

					<div class="keyword-con">
						<input ref="keywordText" 
							type="text" 
							placeholder="숙제명을 검색해주세요."
							v-model="keyword" 
							v-on:keyup.enter="onSearchList('keyword')">
						<ui-button 
							class="keyword-search-btn"
							@button:click="onSearchList('keyword')">
							<img src="~@/assets/images/common/search_icon_dark.png" />
						</ui-button>
					</div>

				</div>

				<div class="list-con">
					<table class="list-head" ref="listHead">
						<colgroup>
							<col style="width:100px;">
							<col style="width:245px;">
							<col style="width:245px;">
							<col style="width:245px;">
							<col style="">
							<col style="width:140px;">
							<col style="width:140px;">
						</colgroup>
						<thead>
							<tr>
								<th>No</th>
								<th>구분</th>
								<th>출제일</th>
								<th>마감일</th>
								<th>숙제명</th>
								<th>수행</th>
								<th>업로드</th>
							</tr>
						</thead>
					</table>
					<table class="list-table">
						<colgroup>
							<col style="width:100px;">
							<col style="width:245px;">
							<col style="width:245px;">
							<col style="width:245px;">
							<col style="">
							<col style="width:140px;">
							<col style="width:140px;">
						</colgroup>
						<tbody>
							<tr v-for="(list, i) in listData" :key="list.key">
								<td class="center">
									<div :class="parseInt(list.time_out) === 1 ? 'timeout' : ''" 
										v-list-flip="{key: i+'-'+1, delay: 0.15 * i, loadCount: loadCount}">
										{{list.no}}
									</div>
								</td>
								<td>
									<div :class="parseInt(list.time_out) === 1 ? 'timeout' : ''" 
										v-list-flip="{key: i+'-'+2, delay: 0.15 * i, loadCount: loadCount}">
										{{list.ucode}}
									</div>
								</td>
								<td class="center">
									<div :class="parseInt(list.time_out) === 1 ? 'timeout' : ''" 
										v-list-flip="{key: i+'-'+3, delay: 0.15 * i, loadCount: loadCount}">
										{{list.s_date ? list.s_date.replace(/-/g, ".") : ''}}
									</div>	
								</td>
								<td class="center">
									<div :class="parseInt(list.time_out) === 1 ? 'timeout' : ''" 
										v-list-flip="{key: i+'-'+4, delay: 0.15 * i, loadCount: loadCount}">
										{{list.e_date ? list.e_date.replace(/-/g, ".") : ''}}
									</div>
								</td>
								<td>
									<div :class="parseInt(list.time_out) === 1 ? 'timeout' : ''" 
										v-list-flip="{key: i+'-'+5, delay: 0.15 * i, loadCount: loadCount}">
										<ui-button v-if="list.title !==''"
											type="a" 
											class="title"
											@button:click="() => $router.push({name: 'MyselfHomworkPictureView', params: { initData: list }})">
											{{list.title}}
										</ui-button>
									</div>
								</td>
								<td class="center">
									<div :class="parseInt(list.time_out) === 1 ? 'timeout' : ''" 
										v-list-flip="{key: i+'-'+6, delay: 0.15 * i, loadCount: loadCount}">
										<img v-if="parseInt(list.time_out) === 0 && parseInt(list.is_upload) === 1" 
											src="~@/assets/images/myself/pic_check_on.png" />
										<img v-if="parseInt(list.time_out) === 1 && parseInt(list.is_upload) === 1" 
											src="~@/assets/images/myself/pic_check_off.png" />
									</div>	
								</td>
								<td class="center">
									<div :class="parseInt(list.time_out) === 1 ? 'timeout' : ''" 
										v-list-flip="{key: i+'-'+7, delay: 0.15 * i, loadCount: loadCount}">
										<ui-button 
											type="a"
											class="upload" 
											v-if="parseInt(list.time_out) === 0 && parseInt(list.is_upload) === 0"
											@button:click="() => $router.push({name: 'MyselfHomworkPictureView', params: { initData: list }})">
											<img src="~@/assets/images/myself/pic_upload.png" />
										</ui-button>
										<img v-if="parseInt(list.time_out) === 0 && parseInt(list.is_upload) === 1" 
											src="~@/assets/images/myself/pic_img_on.png" />
										<img v-if="parseInt(list.time_out) === 1 && parseInt(list.is_upload) === 1" 
											src="~@/assets/images/myself/pic_img_off.png" />
									</div>
								</td>
							</tr>
							<tr v-if="parseInt(pictrueData.total) === 0 && dataLoaded">
								<td colspan="7" class="center empty">등록된 내용이 없습니다.</td>
							</tr>
						</tbody>
					</table>
					<paginate
						v-if="parseInt(pictrueData.total) > 0"
						ref="paginate"
						v-model="currentPage"
						:page-range="10"
						:margin-pages="0"
						:page-count="totalPage"
						:click-handler="pageChange"
						break-view-text=""
						break-view-link-class="break"
						prev-text=""
						next-text=""
						prev-link-class="prev"
						next-link-class="next"
						:no-li-surround="true"
						:container-class="'paginate'">
					</paginate>
				</div>
			</smooth-scrollbar>

		</div>
		<!-- //content-list -->

		<myself-header 
			titleImg="hmwk_pic_title.png" 
			titleTxt="숙제 사진 제출" />
	
	</div>
</template>

<script>
import _ from 'lodash'
import Paginate from 'vuejs-paginate'
import Datepicker from 'vuejs-datepicker'
import { ko } from 'vuejs-datepicker/dist/locale'
import MyselfHeader from '@/components/myself/MyselfHeader'
import { gsap, Cubic, Expo } from 'gsap'


export default {
    
	name: 'homeworkPicture',

	components: {
		Paginate,
		Datepicker,
		MyselfHeader
	},

	data () {
		return {
			ko: ko,
			startDate: (() => {
				const d = new Date()
				if(this.$route.query.type === 'week') {
					d.setDate(d.getDate() - 7)
				} else if(this.$route.query.type === 'month') {
					d.setMonth(d.getMonth() - 1)
				} else if(this.$route.query.type === 'calendar') {
					return new Date(this.$route.query.start)
				}
				return d
			})(),
			
			endDate: (() => {
				if(this.$route.query.type === 'calendar') {
					return new Date(this.$route.query.end)
				}
				return new Date()
			})(),
			disableStartDate: {
				from: new Date()
			},
			disableEndDate: {
				from: new Date()
			},

			weekActive: this.$route.query.type === 'week',
			monthActive: this.$route.query.type === 'month',
			btnClick: false,
			keyword: this.$route.query.keyword || '',

			currentPage: parseInt(this.$route.query.page),
			dataLoaded: false,
			listData: null,
			loadCount: 0

		}
	},

	computed: {
		pictrueData(){
			const datas = this.$store.getters['myself/getPictureData']
			// console.log(datas)
			datas.Lists.map((list, index) => {
				list.key = this.$randomString(10)
				list.no = parseInt(datas.total) - ( index + (this.currentPage-1) * 10)
				return list
			})
			if(parseInt(datas.total) > 0 && datas.Lists.length < 10) {
				const len = 10 - datas.Lists.length
				for(let i=0; i < len; i++) {
					datas.Lists.push({
						key: this.$randomString(10)
					})
				}
			}
			return datas
		},

		totalPage () {
			return Math.ceil(parseInt(this.pictrueData.total) / 10)
		}
	},

	watch: {
		startDate ( newVal ) {
			if( !this.btnClick ){
				this.weekActive = false
				this.monthActive = false
			}
			setTimeout(()=> {
				this.btnClick = false
			})
		},

		endDate ( newVal ) {
			if( !this.btnClick ){
				this.weekActive = false
				this.monthActive = false
			}
			this.disableStartDate.from = newVal
			if(this.startDate > newVal) {
				this.startDate = new Date(newVal)
			}
			setTimeout(()=> {
				this.btnClick = false
			})
		},

		'$route.query' ( newVal ) {
			this.loadData()
		}
	},

	mounted () {
		// 학생이 아니면 error처리
		if(!this.userInfo.id || this.userInfo.type !== 'ST'){
			this.$router.push({name: 'Error'})
			return
		}
		this.$refs.scrollBar.scrollbar.addListener(this.onScroll)
		this.loadData()
	},

	beforeDestroy () {
		this.$refs.scrollBar.scrollbar.removeListener(this.onScroll)
	},

	destroyed () {
		this.$store.dispatch('myself/resetPictureData')
	},

	methods: {

		onSearchList ( type ) {
			let query
			if(type === 'keyword') {
				if(this.keyword !== '') {
					this.keyword = _.trim(this.keyword)
					query = {type: 'keyword', keyword: this.keyword, page: 1}
				} else {
					this.$confirm({
						message: '숙제명을 입력해 주세요.',
						button: [{ name: '확인'}],
						callback: () => {
							this.$refs.keywordText.focus()
						}
					})
					return
				}
				this.weekActive = false
				this.monthActive = false
			} else {
				this.keyword=''
				if( type === 'week' ) {
					this.btnClick = true
					this.weekActive = true
					this.monthActive = false
					var d = new Date()
					d.setDate(d.getDate() - 7)
					this.startDate = d
					this.endDate = new Date()
					query = { 
						type: 'week',
						page: 1
					}
				} else if( type === 'month') {
					this.btnClick = true
					this.weekActive = false
					this.monthActive = true
					var d = new Date()
					d.setMonth(d.getMonth() - 1)
					this.startDate = d
					this.endDate = new Date()
					query = { 
						type: 'month', 
						page: 1 
					}
				} else {
					query = {
						type: 'calendar', 
						start: this.$dateformat(this.startDate, 'yyyy-mm-dd'), 
						end: this.$dateformat(this.endDate, 'yyyy-mm-dd'),
						page: 1
					}
				}
			}
			this.currentPage = 1
			this.$router.push({query: query}).catch(( err ) => {})
		},

		async loadData () {
			this.dataLoaded = false
			this.$route.query.page = parseInt(this.$route.query.page)
			let query = {
				pcd_seq: this.userInfo.pcd_seq,
				mem_id: this.userInfo.id,
				view_num: 10,
				...this.$route.query
			}
			
			if(query.type === 'week' || query.type === 'month') {
				query = {
					start: this.$dateformat(this.startDate, 'yyyy-mm-dd'), 
					end: this.$dateformat(this.endDate, 'yyyy-mm-dd'),
					...query
				}
			}
			
			const result = await this.$http.post(`${this.$config.LMSApiURL}/getHmwkOff-picture-list`, query)
			this.$store.dispatch('myself/setPictureData', result.data )
			this.listData = _.cloneDeep( this.pictrueData.Lists )
			this.dataLoaded = true
			if(this.pictrueData.total === 0) {
				this.loadCount=0
			} else {
				this.loadCount++
			}
			this.$refs.scrollBar.scrollbar.scrollTop = 0
		},

		pageChange ( page ) {
			const query = Object.assign(_.cloneDeep(this.$route.query), {page: page})
			this.$router.push({ query }).catch(( err ) => {})
			this.currentPage = page
		},

		onScroll ( e ) {
			if(e.offset.y >= 184) {
				gsap.set(this.$refs.listHead, {y: e.offset.y - 184})
			} else {
				gsap.set(this.$refs.listHead, {y: 0})
			}
		}

	}
}
</script>

<style lang="scss">
#homework-picture {
    @include fullSize();
    .content-list{
		width: 100%;
		height: 100%;
		padding-top: 220px;
		margin: 0 auto;
    	box-sizing: border-box;
		overflow: hidden;
		> div {
			padding: 0 60px;
			margin-top: 10px;
			height: calc(100% - 20px);
			overflow: visible !important;
		}
		.top-title {
			padding-top: 50px;
			
			.week-btn,
			.month-btn {
				display: inline-block;
				vertical-align: middle;
				width: 214px;
				height: 92px;
				margin-right: 10px;
				background: url('~@/assets/images/myself/tab_s_bg.png') no-repeat;
				background-position-y: -92px;
				font-size: 32px;
				font-weight: 600;
				color: #cfcfcf;
				line-height: 73px;
				transition: color 0.4s;
				&.active{
					background-position-y: 0;
					color: #fff;
				}
				&:hover,
				&.down {
					color: #fff;
				}
			}

			.vdp-datepicker {
				position: relative;
				top:-5px;
				display: inline-block;
				width: 265px;
				height: 68px;
				margin-right: 10px;
				cursor: pointer;
				input[type="text"] {
					text-align: left;
					width: 265px;
					height: 68px;
					border: solid 4px #ddd;
					box-sizing: border-box;
					padding: 0 25px;
					outline: none;
					font-size: 28px;
					font-weight: 500;
					color: #aaa;
					cursor: pointer;
				}
				&.start-date {
					margin-left: 20px;
					input[type="text"] {
						border-top-left-radius: 10px;
						border-bottom-left-radius: 10px;
						border-right: none;
					}
				}
				&.end-date {
					margin-left: -12px;
					input[type="text"] {
						border-top-right-radius: 10px;
						border-bottom-right-radius: 10px;
					}
				}
				&:after {
					content: '';
					display: inline-block;
					position: absolute;
					right: 20px;
    				top: 15px;
					width: 33px;
					height: 33px;
					background: url('~@/assets/images/common/calendar_icon.png') no-repeat;
					pointer-events: none;
				}
			}

			.date-search-btn {
				position: relative;
				top: 4px;
				width: 80px;
				height: 80px;
				background-color: #00bfe6;
				border-radius: 12px;
				box-shadow: 4px 4px 1px rgba(0,0,0,0.15);
			}

			.keyword-con {
				position: absolute;
				right: 0;
				top:52px;
				width: 553px;
				height: 80px;
				background-color: #fff;
				border-radius: 40px;
				border: solid 4px #ddd;
				box-shadow: 4px 4px 1px rgba(0,0,0,0.15);
				input[type="text"] {
					margin: 17px 25px;
					font-size: 32px;
					font-weight: 500;
					border: none;
					outline: none;
					width: 425px;
					vertical-align: middle;
				}
				.keyword-search-btn {
					margin: 10px 0;
					vertical-align: middle;
				}
			}
		}

		.list-con{
			margin-top:20px;
			.list-head {
				position: relative;
				width: 100%;
				border-radius: 8px;
				overflow: hidden;
				z-index: 2;
				thead {
					border-top: solid 4px #006073;
				}
				thead th {
					padding:0 5px;
					height: 67px;
					border-left: solid 2px #8ac4d1;
					vertical-align: middle;
					background-color: #b2e1eb;
					font-size: 25px;
					font-weight: 500;
					color: #222;
					&:first-child {
						border-left: none;
					}
				}
			}
			.list-table {
				width: 100%;
				border-radius: 8px;
				overflow: hidden;
				box-shadow:1px 1px 5px rgba(0,0,0,0.2);
				tbody tr {
					transition: background-color 0.4s;
					border-bottom: solid 2px #eee;
					td {
						position: relative;
						border-left: solid 2px #eee;
						font-size: 32px;
						font-weight: 400;
						vertical-align: middle;
						overflow: hidden;
						height: 78px;
						background-color: #fff;
						&:first-child {
							border-left: none;
						}
						> div {
							padding: 20px 20px 0 20px;
							height: 100%;
							background-color: #fff;
							box-sizing: border-box;
						}
						> div > a{
							font-size: 32px;
							font-weight: 500;
							&.title {
								white-space: nowrap;
								text-overflow: ellipsis;
								max-width: 640px;
								overflow: hidden;
								display: inline-block;
								color: #00a2d8;
								&:hover {
									text-decoration: underline;
								}
							}
							&.upload {
								position: relative;
								top: -6px;
							}
						}
						> div.timeout {
							color: #ccc;
							.title {
								color: #ccc;
							}
						}
						> div.timeout > a{
							font-weight: normal;
						}
						&.center{
							text-align: center;
						}	
						&.empty {
							height: 515px;
						}
					}
					&:hover {
						td > div {
							background-color: #f0fdff;
						}
					}
				}
					
			}
		}
    }

    
}
</style>