<template>
	<div id="my-gallery">

		<!-- content-view -->
		<div class="content-view" v-if="galleryData && dataLoaded">

			<!-- list-con -->
			<div class="list-con">
				<div v-if="galleryData.length > 0">
					<swiper :options="swiperOption">
						<swiper-slide v-for="(list, index) in galleryData" :key="list.list_id">
							<a @click.prevent="onClickList( list, index )">
								<img :src="$config.LMS_URL + list.imgs[0]" />
								<span v-if="list.imgs.length > 1" class="more">+{{list.imgs.length}}</span>
								<transition name="zoom">
									<span v-if="downloadMode" 
										:class="['check', downloadList.indexOf( index ) > -1 ? 'active' : '']">
									</span>
								</transition>
								<div class="title">{{getListTitle(list.level, list.part, list.day)}}</div>
								<div class="bcode" v-for="(bcode, i) in getBookCode(list.level, list.part, list.day)" :key="i">
									[ {{bcode.replace('-', ' ')}} ]
								</div>
							</a>
						</swiper-slide>
					</swiper>
					<div class="swiper-button-next"></div>
					<div class="swiper-button-prev"></div>
					<div class="swiper-pagination"></div>
				</div>
				<div v-else class="no-data">
					등록된 내용이 없습니다.
				</div>
			</div>
			<!-- //list-con -->
			
			<transition name="fade">
				<ui-button 
					v-show="!downloadMode && galleryData.length > 0"
					class="down-btn"
					@button:click="() => downloadMode = true">
				</ui-button>
			</transition>

			<transition name="fade">
				<ui-button 
					v-show="downloadMode && galleryData.length > 0"
					class="down-cancel-btn"
					@button:click="onDownloadCancel">
				</ui-button>
			</transition>

			<transition name="fade">
				<ui-button 
					v-show="downloadMode && galleryData.length > 0"
					class="down-ok-btn"
					@button:click="onDownloadOk">
				</ui-button>
			</transition>

		</div>
		<!-- //content-view -->

		<myself-header 
			titleImg="mygallery_title.png" 
			titleTxt="프로젝트 결과물" />

		<!-- image-viewer -->
		<image-viewer ref="imageViewer" :image-list="showImage" />
		<!-- //image-viewer -->
	</div>
</template>

<script>

import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import ImageViewer from '@/components/myself/ImageViewer'
import MyselfHeader from '@/components/myself/MyselfHeader'
import download from 'downloadjs'

export default {
    
	name: 'myGallery',

	components: {
      Swiper,
		SwiperSlide,
		ImageViewer,
		MyselfHeader
	},

	data () {
		return {

			swiperOption: {
				slidesPerView: 5,
  				spaceBetween: 20,
				observer: true,
				centerInsufficientSlides: true,
				navigation: {
					nextEl: '#my-gallery .content-view .swiper-button-next',
					prevEl: '#my-gallery .content-view .swiper-button-prev',
				},
				pagination: {
					el: '#my-gallery .content-view .swiper-pagination',
					clickable:true
				}
			},
			dataLoaded: false,
			showImage: null,
			downloadMode: false,
			downloadList: []
		}
	},

	computed: {
		galleryData(){
			return this.$store.getters['myself/getGalleryData']
		}

	},

	mounted () {
		// 학생이 아니면 error처리
		if(!this.userInfo.id || this.userInfo.type !== 'ST'){
			this.$router.push({name: 'Error'})
			return
		}

		this.loadData()
	},

	destroyed () {
		this.$store.dispatch('myself/resetGalleryData')
	},

	methods: {
		getListTitle ( level, part, day ) {
			return `${level}${part}-Day${day}`
		},

		getBookCode (level, part, day) {
			const bcode = LM.returnBookCode(level, part, day).split('_')[4]
			if(bcode) return bcode.split('/')
			return []
		},

		async loadData () {
			this.dataLoaded = false
			const result = await this.$http.post(`${this.$config.LMSApiURL}/getMyGallery-list`, {
				stu_id: this.userInfo.id
			})
			this.$store.dispatch( 'myself/setGalleryData', result.data )
			this.dataLoaded = true
		},

		onClickList ( list, idx ) {
			if(!this.downloadMode) {
				// this.showImage = list
				this.showImage = { 
					images: list.imgs, 
					ucode: this.getListTitle(list.level, list.part, list.day),
					bookCodes : this.getBookCode(list.level, list.part, list.day)
				}
				this.$refs.imageViewer.show = true
			} else {
				let findList = false
				this.downloadList.forEach( list => {
					if(list == idx) {
						findList = true
						this.downloadList.splice(this.downloadList.indexOf(idx), 1)
					}
				})
				if(!findList) {
					this.downloadList.push( idx )
				}
			}
		},

		onDownloadCancel () {
			this.downloadMode = false
			this.downloadList = []
		},

		onDownloadOk () {
			if(this.downloadList.length > 0) {
				this.$confirm({
					message: `선택된 항목을 다운로드<br />하시겠습니까?`,
					button: [
						{ name: '취소', value: false },
						{ name: '확인', value: true }
					],
					callback: async (confirm) => {
						if(confirm) {
							// console.log('download', this.downloadList)
							this.downloadList.forEach( i => {
								this.galleryData[i].imgs.forEach(( img, j ) => {
									// console.log(img.split(".")[1])
									var owner = this
									var x=new XMLHttpRequest()
									x.open( "GET", this.$config.LMS_URL + img , true)
									x.responseType="blob"
									x.onload= function(e){
										download(e.target.response, `${owner.getListTitle(owner.galleryData[i].level, owner.galleryData[i].part, owner.galleryData[i].day)}-${j+1}.${img.split(".")[1]}`);
									}
									x.send()
								})
							})
							this.onDownloadCancel()
						}
					}
				})
			} else {
				this.$confirm({
					message: '다운로드할 사진을 선택해 주세요.',
					button: [
						{ name: '확인'} 
					]
				})
			}
		}
	}
}
</script>

<style lang="scss">
#my-gallery{
	@include fullSize();
	.content-view{
		width: 1800px;
		padding-top: 220px;
		margin: 0 auto;
		.list-con {
			position: relative;
			width: 100%;
			height: 740px;
			background-color: #fff;
			text-align: center;
			box-sizing: border-box;
			margin-top:60px;
			border-radius: 40px;
			box-shadow: 1px 3px 4px rgba(0,0,0,0.1);
			.no-data {
				font-size: 32px;
				font-weight: 500;
				width: 100%;
				height: 100%;
				@include displayFlex;	
			}
			> div {
				width: 1530px;
				height: 630px;
				margin: 0 auto;
				padding-top: 50px;
			}
		}
		.swiper-container{
			box-sizing: border-box;
			height: 100%;
		}

		.swiper-slide {
			@include displayFlex(flex-start, center);
			> a {
				position: relative;
				display: block;
				width: 276px;
				height: 418px;
				border: solid 4px #eee;
				border-radius: 16px;
				background-color: #fff;
				cursor: pointer;
				transition: border-color 0.4s;
				box-shadow: 0px 4px 1px rgba(0,0,0,0.02);
			}
			> a:hover,
			> a.down {
				border-color: #93e640;
			}
			> a > img {
				width: 100%;
				height: 100%;
				border-radius: 13px;
				object-fit: cover;
				vertical-align: middle;
			}
			> a > .more {
				position: absolute;
				right: 0;
				bottom: 0;
				background-color: rgba(0,0,0,0.6);
				color: #fff;
				font-size: 32px;
				font-weight: 600;
				width: 88px;
				height: 64px;
				border-top-left-radius: 12px;
				border-bottom-right-radius: 12px;
				line-height: 64px;
			}
			> a > .check {
				position: absolute;
				left: -15px;
    			top: -15px;
				width: 64px;
				height: 64px;
				background: url('~@/assets/images/myself/select_icon.png') no-repeat;
				&.active {
					background-position-y: -64px;
				}
			}
			.title {
				margin-top: 28px;
				font-size: 36px;
				font-weight: 600;
				color: #00a2d8;
			}
			.bcode {
				margin-top: 10px;
				font-size: 28px;
				font-weight: 500;
			}
		}
		.swiper-container {
			padding: 15px;
		}
		.swiper-button-prev,
		.swiper-button-next {
			top: 350px;
			outline: none;
			width: 80px;
			height: 84px;
			&:after {
				display: none;
			}
			&.swiper-button-disabled {
				opacity: 1;
				background-position-y: -84px;
			}
		}
		.swiper-button-prev {
			left: 40px;
			background: url('~@/assets/images/common/swiper_prev2.png') no-repeat;
		}
		.swiper-button-next {
			right: 40px;
			background: url('~@/assets/images/common/swiper_next2.png') no-repeat;
		}
		.swiper-pagination {
			position: relative;
			display: inline-block;
			left: 0;
			top: 30px;
		}
		.swiper-pagination-bullet{
			margin: 0 10px;
			width: 24px;
			height: 24px;
			outline: none;
			border-radius: 15px; 
			transition: width 0.3s;
			background-color: #222;
		}
		.swiper-pagination-bullet-active {
			width: 48px;
		}

		.down-btn{
			position: absolute;
			right: 25px;
			bottom: 25px;
			width: 160px;
			height: 168px;
			background: url('~@/assets/images/myself/pic_down_btn.png') no-repeat;
			z-index: 3;
			transition: all 0.4s;
			&:hover,
			&.down {
				transform: scale(1.1);
			}
		}

		.down-cancel-btn{
			position: absolute;
			right: 210px;
			bottom: 25px;
			width: 160px;
			height: 168px;
			background: url('~@/assets/images/myself/cancel_btn.png') no-repeat;
			z-index: 4;
			transition: all 0.4s;
			&:hover,
			&.down {
				transform: scale(1.1);
			}
		}

		.down-ok-btn{
			position: absolute;
			right: 25px;
			bottom: 25px;
			width: 160px;
			height: 168px;
			background: url('~@/assets/images/myself/download_btn.png') no-repeat;
			z-index: 5;
			transition: all 0.4s;
			&:hover,
			&.down {
				transform: scale(1.1);
			}
		}
	}
}
</style>