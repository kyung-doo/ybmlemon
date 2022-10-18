<template>
	<div id="qna">
		<!-- content-list -->
		<div class="content-list">
			<smooth-scrollbar ref="scrollBar">
				<div class="list-con">
					<table class="list-head" ref="listHead">
						<colgroup>
							<col style="width:100px;">
							<col style="width:560px;">
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
					<table class="list-table">
						<colgroup>
							<col style="width:100px;">
							<col style="width:560px;">
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
										<ui-button class="answer"
										 	v-if="list.is_reply && parseInt(list.is_reply) === 1"
											type="a" 
											@button:click="onClickList(list)">
										</ui-button>
									</div>
								</td>
								<td class="center">
									<div v-list-flip="{key: i+'-'+4, delay: 0.15 * i, loadCount: loadCount}">{{list.reg_date ? list.reg_date.split(' ')[0].replace(/-/g, ".") : ''}}</div>
								</td>
							</tr>
							<tr v-if="parseInt(qnaData.total) === 0 && dataLoaded">
								<td colspan="4" class="center empty">등록된 내용이 없습니다.</td>
							</tr>
						</tbody>
					</table>
					<div class="list-bottom">
						<ui-button class="write-btn" @button:click="onWriteQna">
							<img src="~@/assets/images/myself/write_icon.png" />글쓰기
						</ui-button>
					</div>

					<paginate
						:style="{'visibility' : parseInt(qnaData.total) > 0 ? 'visible' : 'hidden'}"
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
			titleImg="qna_title.png" 
			titleTxt="학습 Q&A" />

		<text-viewer ref="textViewer"
			:init-data="viewerData"
			viewer-type="qna"
			:viewer-mode="viewerMode"
			@update-list="updateList">
		</text-viewer>
		
		<home-button />
		<exit-button />
	</div>
</template>

<script>

import Paginate from 'vuejs-paginate'
import TextViewer from '@/components/myself/TextViewer'
import MyselfHeader from '@/components/myself/MyselfHeader'
import { gsap, Cubic, Expo } from 'gsap'


export default {
    
	name: 'qna',

	components: {
		Paginate,
		TextViewer,
		MyselfHeader
	},

	data () {
		return {
			dataLoaded: false,
			currentPage: parseInt(this.$route.query.page),
			viewerMode: 'view',
			viewerData: null,
			listData: null,
			loadCount: 0
		}
	},

	computed: {
		latestHmwkOff () {
			return this.$store.getters['myself/getLatestHomeworkOff']
		},
		

		qnaData(){
			const datas = this.$store.getters['myself/getQnaData']
			datas.Lists.map((list, index) => {
				list.key = this.$randomString(10)
				list.no = parseInt(datas.total) - ( index + (this.currentPage-1) * 10)
				list.partTitle = `${list.level}${list.part}-Day${list.day} [${list.Bcode} ${list.Bno}-${list.Lno}]`
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
			return Math.ceil(parseInt(this.qnaData.total) / 10)
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
		this.$store.dispatch('myself/resetQnaData')
	},

	methods: {

		listNo( idx ) {
			return parseInt(this.qnaData.total) - ( idx + (this.currentPage-1) * 10)
		},

		pageChange ( page ) {
			const query = Object.assign(_.cloneDeep(this.$route.query), {page: page})
			this.$router.push({ query }).catch(( err ) => {})
			this.currentPage = page
		},

		async loadData () {
			this.dataLoaded = false
			const page = parseInt(this.$route.query.page)
			const query = {
				mem_id: this.userInfo.id,
				view_num: 10,
				page: page,
				orderby: 'date'
			}
			const result = await this.$http.post(`${this.$config.LMSApiURL}/getStdQna-list`, query)
			this.$store.dispatch( 'myself/setQnaData', result.data )
			this.listData = _.cloneDeep( this.qnaData.Lists )
			this.dataLoaded = true
			if(parseInt(this.qnaData.total) === 0) {
				this.loadCount=0
			} else {
				this.loadCount++
			}
			this.$refs.scrollBar.scrollbar.scrollTop = 0
		},

		updateList ( mode ) {
			if(mode === 'delete' && this.currentPage > 1 && this.qnaData.Lists.length === 1) {
				this.pageChange(this.currentPage - 1)
			} else {
				this.loadData()
			}
		},

		async onClickList ( list ) {
			const result = await this.$http.post(`${this.$config.LMSApiURL}/getStdQna-view`, {
				list_id: list.list_id
			})
			this.viewerData = result.data
			this.viewerMode = 'view'
			this.$refs.textViewer.show = true
		},

		onWriteQna () {
			this.viewerData = null
			this.viewerMode = 'edit'
			this.$refs.textViewer.show = true
		},

		onScroll ( e ) {
			if(e.offset.y >= 80) {
				gsap.set(this.$refs.listHead, {y: e.offset.y - 80})
			} else {
				gsap.set(this.$refs.listHead, {y: 0})
			}
		}
	}
}
</script>

<style lang="scss">
#qna {
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
		.list-con{
			padding-top:68px;
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
								max-width: 790px;
								overflow: hidden;
								display: inline-block;
								vertical-align: middle;
								&:hover {
									text-decoration: underline;
								}
							}
							&.answer {
								display: inline-block;
								width: 49px;
								height: 48px;
								background: url('~@/assets/images/myself/answer_icon.png') no-repeat;
								vertical-align: middle;
								margin-left: 15px;
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

		.list-bottom {
			position: relative;
			height:0;
			> button {
				position: absolute;
				right:0;
				top:30px;
				width: 239px;
				height: 72px;
				font-size: 32px;
				font-weight: 600;
				z-index: 3;
				box-shadow: 4px 4px 1px rgba(0,0,0,0.15);
				background-color: #00ab7c;
				color: #fff;
				border-radius: 35px;
				> img {
					margin-right: 15px;
					vertical-align: bottom;
				}
			}
		}
	}
}
</style>