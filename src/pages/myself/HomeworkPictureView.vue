<template>
	<div id="homework-picture-view">

		<!-- content-view -->
		<div class="content-view" v-if="pictureData">

			<!-- top-con -->
			<div class="top-con">
				<ui-button class="back-btn"
					@button:click="() => $router.go(-1)">
				</ui-button>
				<h4 class="top-title" v-html="topTitle" />
			</div>
			<!-- //top-con -->

			<!-- list-con -->
			<div class="list-con">
				<div v-if="parseInt(pictureData.length) > 0">
					<swiper class="swiper" :options="swiperOption">
						<swiper-slide v-for="(list, index) in pictureData" :key="list.pic_id">
							<a @click.prevent="onClickList( list, index )">
								<img :src="`${$config.LMS_URL}${list.filename}`" />
								<!-- <div style="position: absolute;right: 0;top: 0">{{list.pic_id}}</div> -->
								<transition name="zoom">
									<span v-if="deleteMode" 
										:class="['check', deleteList.indexOf( index ) > -1 ? 'active' : '']">
									</span>
								</transition>
							</a>
						</swiper-slide>
					</swiper>
					<div class="swiper-button-next"></div>
					<div class="swiper-button-prev"></div>
					<div class="swiper-pagination"></div>
				</div>
				<div v-else class="no-data">
					<img src="~@/assets/images/myself/no_file_icon.png" />
					업로드된 파일이 없습니다.
				</div>
			</div>
			<!-- //list-con -->

			
			<transition name="fade">
				<ui-button 
					v-if="!deleteMode && parseInt(initData.time_out) === 0"
					:class="['delete-btn', parseInt(pictureData.length) === 0 ? 'disable' : '']"
					@button:click="() => deleteMode = true">
				</ui-button>
			</transition>

			<transition name="fade">
				<ui-button 
					v-if="!deleteMode && parseInt(initData.time_out) === 0"
					:class="['add-btn', parseInt(pictureData.length) === 10 ? 'disable' : '']"
					@button:click="() => showUpload = true">
				</ui-button>
			</transition>

			<transition name="fade">
				<ui-button 
				 	v-show="deleteMode && parseInt(initData.time_out) === 0"
					class="delete-cancel-btn"
					@button:click="onCancelDelete">
				</ui-button>
			</transition>

			<transition name="fade">
				<ui-button 
					v-show="deleteMode && parseInt(initData.time_out) === 0"
					class="delete-ok-btn"
					@button:click="onDeleteOk">
				</ui-button>
			</transition>

		</div>
		<!-- //content-view -->

		<myself-header 
			titleImg="hmwk_pic_title.png" 
			titleTxt="숙제 사진 제출" />

		<!-- image-viewer -->
		<image-viewer ref="imageViewer" :image-list="showImage" />
		<!-- //image-viewer -->

		<!-- upload-popup -->
		<div class="upload-popup" v-show="showUpload">
			<transition name="transition-up">
				<div class="popup-wrap" v-if="showUpload">
					
					<!-- pop-title -->
					<div class="pop-title">사진 첨부하기</div>
					<!-- //pop-title -->

					<!-- pop-content -->
					<div class="pop-content">

						<div class="file-count">
							<span>{{ pictureData.length + files.length }}장</span>/{{ maxUploads }}장
						</div>

						<!-- file-zone -->
						<div class="file-zone">
							
							<div v-if="files.length > 0" class="file-list">
								<smooth-scrollbar ref="scrollBar">
									<ul v-if="files.length">
										<li v-for="file in files" :key="file.id">
											<div class="thumb">
												<img :src="file.blob" />
											</div>
											<div class="text-con">
												<div class="name">{{file.name}}</div>
												<div class="size">{{$fileSize(file.size)}}</div>
											</div>

											
											<div class="right">

												<div class="progress-set" v-if="file.active || (file.success && !file.error && (file.response && file.response.ok === 1))">
													<div class="txt">{{parseInt(file.progress)}}%</div>
													<div
														:class="['progress', (file.error || (file.response && file.response.ok === 0)) ? 'error': '', 
														(file.success || (file.response && file.response.ok === 1)) ? 'success': '']">
														<span class="bar" :style="`width:${parseInt(file.progress)}%`"></span>
													</div>
												</div>

												<span class="faile-txt" v-if="file.error || (file.response && file.response.ok === 0)">실패</span>

												<ui-button v-if="!file.success && !file.error && !file.active"  
													@button:click.prevent="deleteFile(file)">
													삭제
												</ui-button>

												<ui-button v-if="file.error || (file.response && file.response.ok === 0)" 
													@button:click.prevent="resendFile(file)">
													재전송
												</ui-button>
											</div>


										</li>
									</ul>
								</smooth-scrollbar>
							</div>

							<div v-else class="drop-guide">
								<img src="~@/assets/images/myself/pic_add_icon.png" />
								클릭하여 업로드 또는 파일을 드래그 해주세요.
								<label for="file"></label>
							</div>

						</div>
						<!-- //file-zone -->
						
						<!-- file-upload -->
						<file-upload class="file-btn"
							:post-action="`${$config.LMSApiURL}/setHmwkOff-picture`"
							:multiple="true"
							:data="formData"
							:drop="!uploaded"
							:maximum="canUploadsLength"
							accept="image/png,image/gif,image/jpeg"
							:extensions="/\.(jpeg|jpe|jpg|gif|png)$/i"
							:drop-directory="true"
							v-model="files"
							ref="upload"
							@input-filter="inputFilter">
						</file-upload>
						<!-- //file-upload -->

						<div class="count-guide">
							<span>한 장당 10MB, 10개</span>의 이미지 파일을 등록할 수 있습니다.<br />(JPG, GIF, PNG, BMP)
						</div>
					</div>
					<!-- //pop-content -->

					<!-- pop-bottom -->
					<div class="pop-bottom">
						<ui-button class="left" v-if="!uploaded" @button:click="cancelUpload">취소</ui-button>
						<ui-button v-if="!uploaded" @button:click="startUpload">업로드</ui-button>
						<ui-button v-if="uploaded && !$refs.upload.active" @button:click="endUpload">확인</ui-button>
					</div>
					<!-- //pop-bottom -->

					<!-- close-btn -->
					<ui-button
						class="close-btn" 
						title="닫기" 
						@button:click="cancelUpload">
					</ui-button>
					<!-- //close-con -->

				</div>
			</transition>
		</div>
		<!-- //upload-popup -->
			
	</div>
</template>

<script>
import _ from 'lodash'
import FileUpload from 'vue-upload-component'
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'

import ImageViewer from '@/components/myself/ImageViewer'
import MyselfHeader from '@/components/myself/MyselfHeader'

export default {
    
	name: 'homeworkPictureView',

	components: {
      Swiper,
      SwiperSlide,
		FileUpload,
		ImageViewer,
		MyselfHeader
   },

	props: {
		initData: { type: Object, default: null }
	},

	data () {
		return {
			swiperOption: {
				slidesPerView: 5,
  				spaceBetween: 20,
				observer: true,
				centerInsufficientSlides: true,
				navigation: {
					nextEl: '#homework-picture-view .content-view .swiper-button-next',
					prevEl: '#homework-picture-view .content-view .swiper-button-prev',
				},
				pagination: {
					el: '#homework-picture-view .content-view .swiper-pagination',
					clickable:true
				}
			},
			pictureData: null,
			files: [],
			showUpload: false,
			deleteMode: false,
			deleteList: [],
			maxUploads: 10,
			maxFileSize: 10,
			uploaded: false,
			showImage: null
		}
	},

	computed: {
		canUploadsLength () {
			return this.maxUploads - this.pictureData.length
		},
		formData () {
			return {
				list_id: this.initData.list_id
			}
		},
		topTitle () {
			const title = this.initData.title
			const titleSplit = title.split(' ')
			let str = ''
			titleSplit.forEach(( tit, i ) => {
				if(i == 0) {
					str += tit
					str += '<span>'
				} else if( i === titleSplit.length) {
					str += tit
					str += '</span>'
				} else {
					str += tit + ' '
				}
			})
			return str
		}
	},

	async mounted () {
		// 학생이 아니면 error처리
		if(!this.userInfo.id || this.userInfo.type !== 'ST'){
			this.$router.push({name: 'Error'})
			return
		}

		if(!this.initData) {
			this.$router.go(-1)
			return
		}

		const result = await this.$http.post(`${this.$config.LMSApiURL}/getHmwkOff-picture-view`, {
			list_id: this.initData.list_id
		})
		this.pictureData = result.data
	},

	methods: {
		inputFilter(newFile, oldFile, prevent) {
			if (newFile && !oldFile) {
				if (!/\.(jpeg|jpe|jpg|gif|png)$/i.test(newFile.name)) {
					this.$confirm({
						message: '이미지 파일 형식만<br />업로드 가능 합니다.',
						button: [
							{ name: '확인'} 
						]
					})
					return prevent()
				}

				if (newFile.size > 1024 * 1024 * this.maxFileSize) {
					this.$confirm({
						message: `이미지 용량은 ${this.maxFileSize}MB 이하로<br />업로드 가능 합니다.`,
						button: [
							{ name: '확인'} 
						]
					})
					return prevent()
				}
			}

			newFile.blob = ''
			let URL = window.URL || window.webkitURL
			if (URL && URL.createObjectURL) {
				newFile.blob = URL.createObjectURL(newFile.file)
			}
		},
		
		startUpload () {
			if(this.files.length > 0) {
				this.$refs.upload.active = true
				this.uploaded = true	
			} else {
				this.$confirm({
					message: '파일을 선택해 주세요.',
					button: [
						{ name: '확인'} 
					]
				})
			}
		},

		cancelUpload () {
			this.showUpload = false;
			this.$refs.upload.clear()
			this.uploaded = false
		},

		endUpload () {
			this.files.forEach(( fileObj ) => {
				if(fileObj.success && fileObj.response.ok === 1) {
					this.pictureData.push({
						pic_id: fileObj.response.pic_id, 
						filename: fileObj.response.filename
					})
				}
			})
			this.cancelUpload()
		},

		deleteFile ( file ) {
			this.$refs.upload.remove( file )
		},

		resendFile ( file ) {
			this.$refs.upload.update(file, {
				active: false, 
				error: '', 
				success: false, 
				progress: 0, 
				response: {}
			})
			this.$refs.upload.active = true
		},

		onCancelDelete( e ) {
			this.deleteMode = false
			this.deleteList = []
		},

		onDeleteOk () {
			if(this.deleteList.length > 0) {
				this.$confirm({
					message: `${this.deleteList.length}개의 파일을 삭제하시겠습니까?`,
					button: [
						{ name: '취소', value: false },
						{ name: '확인', value: true }
					],
					callback: async (confirm) => {
						if(confirm) {
							const delList = this.deleteList.map( idx => this.pictureData[idx].pic_id)
							await this.$http.post(`${this.$config.LMSApiURL}/deleteHmwkOff-picture`, { 
								pic_id: JSON.stringify(delList)
							})

							delList.forEach(( id ) => {
								const idx = this.pictureData.map( list => {
									return list.pic_id
								}).indexOf( id )	
								this.pictureData.splice(idx, 1)
							})
							this.onCancelDelete()
						}
					}
				})
			} else {
				this.$confirm({
					message: '삭제할 파일을 선택해 주세요.',
					button: [
						{ name: '확인'} 
					]
				})
			}
		},

		onClickList ( list, idx ) {
			if(!this.deleteMode) {
				this.showImage = {images: [list.filename]}
				this.$refs.imageViewer.show = true
			} else {
				let findList = false
				this.deleteList.forEach( list => {
					if(list == idx) {
						findList = true
						this.deleteList.splice(this.deleteList.indexOf(idx), 1)
					}
				})
				if(!findList) {
					this.deleteList.push( idx )
				}
			}
		}
	}
}
</script>

<style lang="scss">
#homework-picture-view {
	@include fullSize();
	.content-view{
		width: 1800px;
		padding-top: 220px;
		margin: 0 auto;
		.top-con {
			padding-top: 60px;
			@include displayFlex(center, flex-start);
			.back-btn{
				width: 72px;
				height: 76px;
				background: url('~@/assets/images/myself/list_btn.png') no-repeat;
			}
			.top-title{
				margin-left: 10px;
				font-size: 56px;
				font-weight: 600;
				> span {
					vertical-align: middle;
					margin-left: 20px;
					font-size: 40px;
					font-weight: 500;
				}
			}
		}

		.list-con {
			position: relative;
			width: 100%;
			height: 608px;
			background-color: #fff;
			text-align: center;
			box-sizing: border-box;
			margin-top:15px;
			border-radius: 40px;
			box-shadow: 1px 3px 4px rgba(0,0,0,0.1);
			.no-data {
				font-size: 32px;
				font-weight: 500;
				width: 100%;
				height: 100%;
				@include displayFlex;	
				flex-direction: column;
				padding-top: 0;
				> img {
					display: block;
					margin-bottom: 30px;
				}
			}
			> div {
				width: 1530px;
				height: 490px;
				margin: 0 auto;
				padding-top: 50px;
			}
		}
		.swiper-container{
			box-sizing: border-box;
			height: 100%;
		}
		
		.swiper-slide {
			@include displayFlex;
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
		}
		.swiper-container {
			padding: 15px;
		}
		.swiper-button-prev,
		.swiper-button-next {
			top: 250px;
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
			top: 25px;
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

		.delete-btn{
			position: absolute;
			right: 210px;
			bottom: 25px;
			width: 160px;
			height: 168px;
			background: url('~@/assets/images/myself/pic_del_btn.png') no-repeat;
			z-index: 4;
			transition: all 0.4s;
			&:hover,
			&.down {
				transform: scale(1.1);
			}
			&.disable {
				pointer-events: none;
				opacity: 0.5;
			}
		}

		.add-btn{
			position: absolute;
			right: 25px;
			bottom: 25px;
			width: 160px;
			height: 168px;
			background: url('~@/assets/images/myself/pic_add_btn.png') no-repeat;
			z-index: 5;
			transition: all 0.4s;
			&:hover,
			&.down {
				transform: scale(1.1);
			}
			&.disable {
				pointer-events: none;
				opacity: 0.5;
			}
		}

		.delete-cancel-btn{
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

		.delete-ok-btn{
			position: absolute;
			right: 25px;
			bottom: 25px;
			width: 160px;
			height: 168px;
			background: url('~@/assets/images/myself/trash_btn.png') no-repeat;
			z-index: 5;
			transition: all 0.4s;
			&:hover,
			&.down {
				transform: scale(1.1);
			}
		}
	}

	.upload-popup {
		position: absolute;
		left: -50%;
		top: 0;
		width: 200%;
		height: 100%;
		background-color: rgba(0,0,0,0.8);
		z-index: 999;
		@include displayFlex;
		.popup-wrap {
			position: relative;
			width: 1200px;
			height: 990px;
			background-color: #fff;
			border-radius: 40px;
		}

		.pop-title {
			height: 97px;
			box-sizing: border-box;
			background-color: #00bfe6;
			border-bottom: solid 4px #0099b8;
			border-top-left-radius: 40px;
			border-top-right-radius: 40px;
			font-size: 40px;
			font-weight: 600;
			color: #fff;
			padding: 25px 40px;
		}

		.pop-content {
			height: 761px;
			padding: 40px;
			box-sizing: border-box;
		}

		.file-count {
			font-size: 28px;
			color: #666;
			margin-bottom: 12px;
			span {
				font-weight: 600;
				color: #38c2df;
			}
		}

		.file-zone {
			width: 1120px;
			height: 507px;
			margin: 0 auto;
			border: solid 2px #eee;
			background-color: #f6f6f6;
			border-radius: 10px;
			.drop-guide {
				position: relative;
				width: 100%;
				height: 100%;
				font-size: 28px;
				font-weight: 500;
				@include displayFlex;
				flex-direction: column;
				> img {
					display: block;
					margin-bottom: 25px;
				}
				> label {
					position: absolute;
					width: 100%;
					height: 100%;
					display: block;
					cursor: pointer;
				}
			}

			.file-list {
				height: 100%;
				.scrollbar-track-y {
					right: 8px;
					transform: scale(0.98)
				}
				ul {
					box-sizing: border-box;
					padding: 8px;
				}
				li {
					position: relative;
					width: 100%;
					height: 120px;
					box-sizing: border-box;
					padding: 10px 30px;
					margin-top: 10px;
					background-color: #fff;
					border-radius: 8px;
					box-shadow: 0px 4px 4px rgba(0,0,0,0.1);
					@include displayFlex(center, flex-start);

					&:first-child {
						margin-top: 0;
					}

					.thumb {
						width: 100px;
						height: 100px;
						border: solid 2px #eee;
						border-radius: 8px;
						overflow: hidden;
						text-align: center;
						background-color: #fff;
						> img {
							width: 100%;
							height: 100%;
							object-fit: cover;
						}
					}

					.text-con {
						width: 720px;
						margin-left: 20px;
						.name {
							max-width: 720px;
							text-overflow:ellipsis;
							white-space:nowrap;
							word-wrap:normal;
							overflow:hidden;
							font-size: 28px;
							font-weight: 500;
						}
						.size {
							font-size: 24px;
							color: #666;
							margin-top: 15px;
						}
					}
					.right {
						.progress-set {
							position: absolute;
							right: 50px;
							top: 30px;
							width: 120px;
							.txt {
								font-size: 24px;
								color: #00bfe6;
								font-weight: 600;
								text-align: center;
							}
							.progress {
								margin-top: 15px;
								overflow: hidden;
								display: inline-block;
								vertical-align: middle;
								width: 100%;
								height: 16px;
								background-color: #eee;
								border-radius: 7px;
								.bar {
									display: block;
									width: 0%;
									height: 100%;
									background-color: #00bfe6;
								}
							}

						}
						.btn {
							position: absolute;
							right: 60px;
							top: 30px;
							width: 96px;
							height: 56px;
							border: solid 4px #ccc;
							font-size: 28px;
							font-weight: 500;
							border-radius: 16px;
						}
						.faile-txt {
							position: absolute;
							right: 165px;
    						top: 42px;
							font-size: 28px;
							font-weight: 500;
							color: #d80000;
						}
					}
					
				}
			}
		}

		.file-btn {
			display: none;
		}


		.count-guide {
			position: relative;
			margin-top: 30px;
			font-size: 28px;
			padding-left: 60px;
			> span {
				font-weight: 600;
				color: #00b5d9;
			}
			&:before {
				content: '';
				position: absolute;
				left: 0;
				top: 13px;
				width: 40px;
				height: 40px;
				background: url('~@/assets/images/myself/info_icon.png') no-repeat;
			}
		}

		
		.pop-bottom {
			@include displayFlex;
			border-radius: 0 0 35px 35px;
			height: 128px;
			border-top: solid 4px #e5e5e5;
			background-color: #f6f6f6;
			.btn {
				text-align: center;
				width: auto;
				min-width: 223px;
				height: 74px;
				margin: 0 5px;
				background-color: #006a80;
				border: solid 4px #006a80;
				color: #fff;
				font-size: 32px;
				font-weight: 600;
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
		}

		.close-btn {
			position: absolute;
			right: -20px;
			top: -20px;
			width: 96px;
			height: 100px;
			z-index: 9;
			background: url('~@/assets/images/common/pop_close.png') no-repeat;
			
		}
		
	}
}
</style>