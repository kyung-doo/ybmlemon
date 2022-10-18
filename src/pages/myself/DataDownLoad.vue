<template>
	<div id="data-download">
		<!-- content-list -->
		<div class="content-list">
			<smooth-scrollbar ref="scrollBar">
				<!-- top-title -->
				<div class="top-title">
					<ui-button 
						type="a"
						:class="['book-btn', currentOrder === 'book' ? 'active': '']"
						@button:click="onChangeSort('book')">
						교재 순 정렬
					</ui-button>
					<ui-button 
						type="a"
						:class="['date-btn', currentOrder === 'date' ? 'active': '']"
						@button:click="onChangeSort('date')">
						등록일 순 정렬
					</ui-button>
				</div>
				<!-- //top-title -->

				<!-- list-con -->
				<div class="list-con">
					<table class="list-head" ref="listHead">
						<colgroup>
							<col style="width:100px;">
							<col style="width:800px;">
							<col style="">
							<col style="width:240px;">
						</colgroup>
						<thead>
							<tr>
								<th>No</th>
								<th>구분</th>
								<th>제목</th>
								<th>등록일</th>
							</tr>
						</thead>
					</table>
					<table class="list-table" ref="listTable">
						<colgroup>
							<col style="width:100px;">
							<col style="width:800px;">
							<col style="">
							<col style="width:240px;">
						</colgroup>
						<tbody>
							<tr v-for="(list, i) in listData" :key="list.key">
								<td class="center">
									<div v-list-flip="{key: i+'-'+1, delay: 0.15 * i, loadCount: loadCount}">{{list.no}}</div>
								</td>
								<td>
									<div class="part" v-list-flip="{key: i+'-'+2, delay: 0.15 * i, loadCount: loadCount}">{{list.partTitle}}</div>
								</td>
								<td>
									<div v-list-flip="{key: i+'-'+3, delay: 0.15 * i, loadCount: loadCount}">
										<ui-button class="title"
											type="a" 
											@button:click="onClickList(list)">
											{{list.subject}}
										</ui-button>
									</div>
								</td>
								<td>
									<div v-list-flip="{key: i+'-'+4, delay: 0.15 * i, loadCount: loadCount}">{{list.reg_date ? list.reg_date.split(' ')[0].replace(/-/g, ".") : ''}}</div>
								</td>
							</tr>
							<tr v-if="parseInt(downloadData.total) === 0 && dataLoaded">
								<td colspan="4" class="center empty">등록된 내용이 없습니다.</td>
							</tr>
						</tbody>	
					</table>

					<paginate
						v-if="parseInt(downloadData.total) > 0"
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
				<!-- //list-con -->
			</smooth-scrollbar>
		</div>
		<!-- //content-list -->

		<div class="part-tab" :class="`active${partIndex}`">
			<ui-tab-menu
				ref="tabMenu"
				:active-index="partIndex"
				@tabmenu:change="onChangeTab">
				<ui-button>Reading</ui-button>
				<ui-button>Speaking</ui-button>
			</ui-tab-menu>
		</div>

		<myself-header 
			titleImg="table_title.png" 
			titleTxt="자료실" />

		<text-viewer ref="textViewer"
			:init-data="viewerData"
			viewer-type="download">
		</text-viewer>

		<home-button />
		<exit-button />
	</div>
</template>

<script>

import _ from 'lodash'
import Paginate from 'vuejs-paginate'
import TextViewer from '@/components/myself/TextViewer'
import MyselfHeader from '@/components/myself/MyselfHeader'
import { gsap, Cubic, Expo } from 'gsap'

export default {
    
	name: 'dataDownload',

	components: {
		Paginate,
		TextViewer,
		MyselfHeader
	},

	data () {
		return {
			partIndex: this.$route.query.part === 'R' ? 1 : 2,
			currentPage: parseInt(this.$route.query.page),
			currentOrder: this.$route.query.orderby,
			dataLoaded: false,
			listData: null,
			viewerData: null,
			loadCount: 0
		}
	},

	computed: {
		ucode_R () {
			const hmwkInfoR = this.$store.getters['myself/getHomeworkOffInfo'].R
			return hmwkInfoR.length > 0 ? hmwkInfoR[1] : ''
		},
		
		ucode_S () {
			const hmwkInfoS = this.$store.getters['myself/getHomeworkOffInfo'].S
			return hmwkInfoS.length > 0 ? hmwkInfoS[1] : ''
		},

		levelR () {
			return this.ucode_R !== '' ? this.$ucodeToLevel(this.ucode_R) : ''
		},

		levelS () {
			return this.ucode_S !== '' ? this.$ucodeToLevel(this.ucode_S) : ''
		},

		latestHmwkOff () {
			return this.$store.getters['myself/getLatestHomeworkOff']
		},

		downloadData(){
			const datas = this.$store.getters['myself/getDownloadData']
			// console.log(datas)
			datas.Lists.map((list, index) => {
				list.key = this.$randomString(10)
				list.no = parseInt(datas.total) - ( index + (this.currentPage-1) * 10)
				list.partTitle = `${list.level}${list.part}-Day${list.day} [${list.Bcode} ${list.Bno}-${list.Lno} : ${list.book_title}]`
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
			return Math.ceil(parseInt(this.downloadData.total) / 10)
		}
	},

	watch: {

		'$route.query' ( newVal ) {
			this.loadData()
		}
	},

	async mounted () {
		// 학생이 아니면 error처리
		if(!this.userInfo.id || this.userInfo.type !== 'ST'){
			this.$router.push({name: 'Error'})
			return
		}

		// homeworkOff ucode가 없을 경우
		if( !this.latestHmwkOff ) {
			const result = await this.$http.post(`${this.$config.LMSApiURL}/getHmwkMain`, { 
				pcd_seq: this.userInfo.pcd_seq,
				mem_id: this.userInfo.id 
			})
			this.$store.dispatch('myself/setHomeworkOffInfo', result.data['RS_hmwk_off'])
		}

		this.$refs.scrollBar.scrollbar.addListener(this.onScroll)

		this.loadData()

	},

	beforeDestroy () {
		this.$refs.scrollBar.scrollbar.removeListener(this.onScroll)
	},

	destroyed () {
		this.$store.dispatch('myself/resetDownloadData')
	},

	methods: {
		onChangeSort ( type ) {
			const query = {
				orderby: type,
				part: this.partIndex === 1 ? 'R' : 'S',
				page: 1
			}
			this.$router.push({query: query}).catch(( err ) => {})
			this.currentOrder = type
			this.currentPage = 1
		},

		onChangeTab ( idx ) {
			const query = {
				orderby: this.currentOrder,
				part: idx === 1 ? 'R' : 'S',
				page: 1
			}
			this.$router.push({query: query}).catch(( err ) => {})
			this.partIndex = idx
			this.currentPage = 1
		},

		async loadData () {
			this.dataLoaded = false
			if((this.partIndex === 1 && this.levelR !== '') || (this.partIndex === 2 && this.levelS !== '')){
				this.$route.query.page = parseInt(this.$route.query.page)
				const query = {
					view_num: 10,
					level:  this.partIndex === 1 ? this.levelR : this.levelS,
					...this.$route.query
				}
				const result = await this.$http.post(`${this.$config.LMSApiURL}/getStdPds-list`, query)
				this.$store.dispatch('myself/setDownloadData', result.data )
				this.listData = _.cloneDeep( this.downloadData.Lists )
			} else {
				this.$store.dispatch('myself/setDownloadData', {
					total: 0,
					page: 0,
					view_num: 10,
					Lists: []
				})
				this.listData = _.cloneDeep( this.downloadData.Lists )
			}
			this.dataLoaded = true
			if(this.downloadData.total === 0) {
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

		async onClickList ( list ) {

			const result = await this.$http.post(`${this.$config.LMSApiURL}/getStdPds-view`, {
				list_id: list.list_id
			})
			this.viewerData = result.data
			this.$refs.textViewer.show = true
		},

		onScroll ( e ) {
			if(e.offset.y >= 180) {
				gsap.set(this.$refs.listHead, {y: e.offset.y - 180})
			} else {
				gsap.set(this.$refs.listHead, {y: 0})
			}
		}
	}
}
</script>

<style lang="scss">
#data-download {
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
			text-align: right;
			padding-top: 55px;
			.book-btn,
			.date-btn {
				display: inline-block;
				vertical-align: middle;
				width: 214px;
				height: 92px;
				margin-right: 10px;
				background: url('~@/assets/images/myself/tab_s_bg.png') no-repeat;
				background-position-y: -92px;
				font-size: 30px;
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
							&.part {
								color: #00a2d8;
							}
						}
						> div > a{
							font-size: 32px;
							font-weight: 500;
							&.title {
								white-space: nowrap;
								text-overflow: ellipsis;
								max-width: 610px;
								overflow: hidden;
								display: inline-block;
								&:hover {
									text-decoration: underline;
								}
							}
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