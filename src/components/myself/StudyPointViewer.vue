<template>
	<div id="study-point-viewer" v-show="show">
		<transition name="transition-up">
			<div :class="['viewer-wrap', remote ? 'disable':'']" v-if="wscData">

				<!-- title-con -->
				<div :class="['title-con', checkReview ? 'active2' : 'active'+tabIndex]">
					<div :class="['part-tit', checkReview ? 'review' : '']" v-html="partTitle" />
					<h4 class="book-tit">{{wscData.book_title}}</h4>
					
					<ui-tab-menu
						ref="tabMenu"
						:active-index="tabIndex" 
						@tabmenu:change="onChangeTab">
						<ui-button v-if="!checkReview">
							<img src="~@/assets/images/myself/word_icon.png" />
							Words
						</ui-button>
						<ui-button v-if="part === 'R'">
							<img src="~@/assets/images/myself/story_icon.png" />
							Story
						</ui-button>
						<ui-button v-else>
							<img src="~@/assets/images/myself/conv_icon.png" />
							Conversation
						</ui-button>
					</ui-tab-menu>
				</div>
				<!-- //title-con -->

				<!-- list-con -->
				<div class="list-con">
					<!-- words -->
					<div class="list-set w" v-if="!checkReview" v-show="tabIndex === 1">
						<div :class="['all-check', checkReview ? 'review' : '']" v-if="mode==='edit'">
							<ui-button
								type="div"
								ref="wordCheckAll"
								class="check"
								:toggle2="true"
								@button:click="onWordsCheckAll">
								<span>전체선택</span>
							</ui-button>
						</div>
						<swiper ref="swiper1"
							class="swiper" 
							:options="{ 
								observer: true, 
								speed: 0,
								navigation: {nextEl: '#study-point-viewer .w .swiper-button-next', prevEl: '#study-point-viewer .w .swiper-button-prev'},
								pagination: {el: '#study-point-viewer .w .swiper-pagination', clickable: true},
								on: {slideChange: onSlideChange}
							}">
							<swiper-slide class="swiper-no-swiping" v-for="(mainList, i) in splitWordsLists()" :key="i">
								<div class="list" v-for="(subList, j) in mainList" :key="i+'_'+j">
									<ui-button 
										:class="['check', mode === 'view' ? 'disable' : '', 
											findChecked( 'W', subList.no ) ? 'active1':'', 
											findChecked( 'Q', subList.no ) ? 'active2':'']"
										@button:click="onCheckWords( subList.no )" />
									<span class="eng">{{subList.en}}</span>
									<span class="kor">{{subList.ko}}</span>
								</div>
							</swiper-slide>
						</swiper>
						<div v-show="splitWordsLists().length > 1">
							<div class="swiper-button-next"></div>
							<div class="swiper-button-prev"></div>
							<div class="swiper-pagination"></div>
						</div>
					</div>
					<!-- words -->

					<!-- story -->
					<div class="list-set s" v-if="part === 'R'" v-show="tabIndex === 2">
						<div :class="['all-check', checkReview ? 'review' : '']" v-if="mode==='edit'">
							<ui-button
								type="div"
								ref="storyCheckAll"
								class="check"
								:toggle="true"
								@button:click="onStoryCheckAll">
								<span>전체선택</span>
							</ui-button>
						</div>
						<swiper ref="swiper2"
							class="swiper" 
							:options="{ 
								observer: true, 
								speed: 0,
								navigation: {nextEl: '#study-point-viewer .s .swiper-button-next', prevEl: '#study-point-viewer .s .swiper-button-prev'},
								pagination: {el: '#study-point-viewer .s .swiper-pagination', clickable: true},
								on: {slideChange: onSlideChange}
							}">
							<swiper-slide class="swiper-no-swiping" v-for="(mainList, i) in splitStoryLists()" :key="i">
								<div :class="['list', $ucodeToLevel(initData.sdl_ucode) >= 3 ? 'noimage' : '']" v-for="(subList, j) in mainList" :key="i+'_'+j">
									<div class="thumb" v-if="$ucodeToLevel(initData.sdl_ucode) < 3">
										<img :src="`${$config.CMS_URL}/LM_cms/data/${wscData.Bcode}/img/summary/${wscData.Bcode}_${wscData.Bno}-${wscData.Lno}_${subList[0].iseq}.jpg`" />
									</div>
									<div class="text-con">
										<div class="text-list" v-for="(textList, k) in subList" :key="i+'_'+j+'_'+k">
											<ui-button 
												:class="['check', mode === 'view' ? 'disable' : '',
													findChecked( 'S', textList.no ) ? 'active':'']"
												@button:click="onCheckStory( textList.no )" />
											<div class="text">
												<p v-if="typeof textList.en === 'string'">{{ textList.en }}</p>
												<p v-else v-for="(title, t) in textList.en" :key="i+'_'+j+'_'+k+'_'+t">
													{{ title }}
												</p>
											</div>
										</div>
									</div>
								</div>
							</swiper-slide>
						</swiper>
						<div v-show="splitStoryLists().length > 1">
							<div class="swiper-button-next"></div>
							<div class="swiper-button-prev"></div>
							<div class="swiper-pagination"></div>
						</div>
					</div>
					<!-- //story -->

					<!-- conversation -->
					<div class="list-set c" v-if="!checkReview && part === 'S'" v-show="tabIndex === 2">
						<div :class="['all-check', checkReview ? 'review' : '']" v-if="mode==='edit'">
							<ui-button
								type="div"
								ref="storyCheckAll"
								class="check"
								:toggle="true"
								@button:click="onStoryCheckAll">
								<span>전체선택</span>
							</ui-button>
						</div>
						<div class="thumb">
							<img :src="`${$config.CMS_URL}/LM_cms/data/PS/img/summary/PS_${wscData.Bno}-${wscData.Lno}_1.jpg`" />
						</div>
						<swiper ref="swiper2"
							class="swiper" 
							:options="{ 
								observer: true, 
								speed: 0,
								navigation: {nextEl: '#study-point-viewer .c .swiper-button-next', prevEl: '#study-point-viewer .c .swiper-button-prev'},
								pagination: {el: '#study-point-viewer .c .swiper-pagination', clickable: true},
								on: {slideChange: onSlideChange}
							}">
							<swiper-slide class="swiper-no-swiping" v-for="(mainList, i) in splitConvLists(4)" :key="i">
								<div class="list-wrap">
									<div class="list" v-for="(subList, j) in mainList" :key="i+'_'+j">
										<ui-button 
											:class="['check', mode === 'view' ? 'disable' : '',
												findChecked( 'S', subList[0] ) ? 'active':'']"
											@button:click="onCheckStory( subList[0] )" />
										<div class="text-con">
											<div class="text">{{subList[1]}}</div>
											<div class="text">{{subList[2]}}</div>
										</div>
									</div>
								</div>
							</swiper-slide>
						</swiper>
						<div v-show="splitConvLists(4).length > 1">
							<div class="swiper-button-next"></div>
							<div class="swiper-button-prev"></div>
							<div class="swiper-pagination"></div>
						</div>
					</div>
					<!-- //conversation -->

					<!-- conversation-review -->
					<div class="list-set c-review" v-if="checkReview && part === 'S'" v-show="tabIndex === 1">
						<div :class="['all-check', checkReview ? 'review' : '']" v-if="mode==='edit'">
							<ui-button
								type="div"
								ref="storyCheckAll"
								class="check"
								:toggle="true"
								@button:click="onStoryCheckAll">
								<span>전체선택</span>
							</ui-button>
						</div>
						<swiper ref="swiper1"
							class="swiper" 
							:options="{ 
								observer: true, 
								speed: 0,
								navigation: {nextEl: '#study-point-viewer .c-review .swiper-button-next', prevEl: '#study-point-viewer .c-review .swiper-button-prev'},
								pagination: {el: '#study-point-viewer .c-review .swiper-pagination', clickable: true},
								on: {slideChange: onSlideChange}
							}">
							<swiper-slide class="swiper-no-swiping" v-for="(mainList, i) in splitConvLists( 2 )" :key="i">
								<div class="list-wrap">
									<div class="list" v-for="(subList, j) in mainList" :key="i+'_'+j">
										<div class="thumb">
											<img :src="`${$config.CMS_URL}/LM_cms/data/PS/img/summary/PS_${subList[4].split('_')[1]}-${subList[4].split('_')[2]}_1.jpg`" />
										</div>
										<div class="text-con">
											<div class="ko">
												<span>{{`PS ${subList[4].split('_')[1]}-${subList[4].split('_')[2]}`}}</span>
												{{subList[3]}}
											</div>
											<div class="en">
												<ui-button 
													:class="['check', mode === 'view' ? 'disable' : '',
														findChecked( 'S', subList[0] ) ? 'active':'']"
													@button:click="onCheckStory( subList[0] )" />
												<div class="text">
													<p>{{subList[1]}}</p>
													<p>{{subList[2]}}</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</swiper-slide>
						</swiper>
						<div v-show="splitConvLists(2).length > 1">
							<div class="swiper-button-next"></div>
							<div class="swiper-button-prev"></div>
							<div class="swiper-pagination"></div>
						</div>
					</div>
					<!-- //conversation-review -->

				</div>
				<!-- //list-con -->


				<!-- close-btn -->
				<ui-button v-if="!remote"
					class="close-btn" 
					title="닫기" 
					@button:click="onClose">
				</ui-button>
				<!-- //close-con -->

			</div>
		</transition>
	</div>
</template>

<script>

import _ from 'lodash'
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'

export default {
	name: 'studyPointViewer',

	components: {
      Swiper,
      SwiperSlide
   },

	props: {
		initData: { type: Object, default: null },
		part: { type: String, default: 'R' },
		mode: { type: String, default: 'view' },
		remote: { type: Boolean, default: false }
	},

	data() {
		return {
			show: false,
			checkLists: {
				W: [],
				S: [],
				Q: []
			},
			wscData: null,
			tabIndex: 1
		}
	},

	computed: {
		partTitle () {
			const level = this.$ucodeToLevel(this.initData.sdl_ucode)
			const part = this.$ucodeToPart(this.initData.sdl_ucode)
			const day = this.$ucodeToDay(this.initData.sdl_ucode)
			return `${level}${part}-Day${day} <span>[ ${LM.returnBookCode(level, part, day).replace('_', ' ').replace('_', ' ').replace('_', ' ~ ')} ]</span>`
		},

		checkReview () {
			const level = this.$ucodeToLevel(this.initData.sdl_ucode)
			const part = this.$ucodeToPart(this.initData.sdl_ucode)
			const day = this.$ucodeToDay(this.initData.sdl_ucode)
			const bookCodes = LM.returnBookCode(level, part, day).split('_')
			return bookCodes[1] === 'Review'
		}
	},

	watch: {
		show ( newVal ) {
			if(newVal) {
				this.tabIndex = 1
				this.setCheckList()
				this.loadWSCData()
			} else {
				this.wscData = null
				this.checkLists = {
					W: [],
					S: [],
					Q: []
				}
			}
		}
	},

	methods: {

		setCheckList () {
			this.checkLists.W = _.cloneDeep(this.initData.hmwk_off_w[0])
			this.checkLists.S = _.cloneDeep(this.initData.hmwk_off_s[0])
			this.checkLists.Q = _.cloneDeep(this.initData.hmwk_off_q[0])
			
		},

		async loadWSCData () {
			const level = this.$ucodeToLevel(this.initData.sdl_ucode)
			const part = this.$ucodeToPart(this.initData.sdl_ucode)
			const day = this.$ucodeToDay(this.initData.sdl_ucode)
			const bookCodes = LM.returnBookCode(level, part, day).split('_')
			let result
			if(bookCodes[1] === 'Review') {
				result = await this.$http.get(`${this.$config.CMSApiURL}/getWSC.php?review_ucode=${this.initData.sdl_ucode}&part=${this.part}`)
			} else {
				result = await this.$http.get(`${this.$config.CMSApiURL}/getWSC.php?Bcode=${bookCodes[0]}&Bno=${bookCodes[1].split('-')[0]}&Lno=${bookCodes[1].split('-')[1]}&part=${this.part}`)
			}
			this.wscData = result.data
		},

		onChangeTab ( idx ) {
			this.tabIndex = idx
			if(this.$refs.swiper1) this.$refs.swiper1.$swiper.slideTo(0, 0)
			if(this.$refs.swiper2) this.$refs.swiper2.$swiper.slideTo(0, 0)
			this.$emit('update', {checkLists: this.checkLists, tabIndex: idx, slideIndex: 0})
		},

		onSlideChange () {
			if(this.tabIndex == 1) {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper1.$swiper.activeIndex})
			} else {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper2.$swiper.activeIndex})
			}
		},

		splitWordsLists () {
			const newList = []
			let count = 0
			let idx = -1
			this.wscData.Word.forEach(( list ) => {
				if(count % 8 === 0) {
					count = 0
					idx++
					newList[idx] = []
				}
				newList[idx].push(list)
				count++
			})
			return newList
		},

		splitStoryLists () {
			const newList1 = []
			this.wscData.Story.forEach(( list ) => {
				if(Array.isArray(list)) {
					var newObj = {"no": list[0].no, "iseq": list[0].iseq, "en": [], "ko": []}
					list.forEach(( li ) => {
						newObj.en.push(li.en)
						newObj.ko.push(li.ko)
					})
					newList1.push(newObj)
				} else {
					newList1.push( list )
				}
			})
			const group =_.groupBy(newList1, 'iseq')
			const newList2 = []
			let count = 0
			let idx = -1
			for (const [key, value] of Object.entries(group)) {
				if(count % 2 === 0) {
					count = 0
					idx++
					newList2[idx] = []
				}
				newList2[idx].push( value )
				count++
			}
			return newList2
		},

		splitConvLists ( len ) {
			const newList = []
			let count = 0
			let idx = -1
			this.wscData.Conv.forEach(( list ) => {
				if(count % len === 0) {
					count = 0
					idx++
					newList[idx] = []
				}
				newList[idx].push(list)
				count++
			})
			return newList
		},

		findChecked ( type, no ) {
			return this.checkLists[type].indexOf( parseInt(no) ) > -1 ? true : false
		},

		onCheckWords ( no ) {
			if( this.checkLists.W.indexOf(parseInt(no)) > -1) {
				_.remove(this.checkLists.W,  n => n === parseInt(no))
				this.checkLists.Q.push( parseInt(no) )
			} else if(this.checkLists.Q.indexOf(parseInt(no)) > -1) {
				_.remove(this.checkLists.Q,  n => n === parseInt(no))
			} else {
				this.checkLists.W.push( parseInt(no) )
			}
			this.$refs.wordCheckAll.$el.classList.remove('active1')
			this.$refs.wordCheckAll.$el.classList.remove('active2')
			if(this.checkLists.W.length === this.wscData.Word.length) {
				this.$refs.wordCheckAll.$el.classList.add('active1')
			}
			if(this.checkLists.Q.length === this.wscData.Word.length) {
				this.$refs.wordCheckAll.$el.classList.add('active2')
			}
			this.$forceUpdate()
			if(this.tabIndex == 1) {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper1.$swiper.activeIndex})
			} else {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper2.$swiper.activeIndex})
			}
		},

		onCheckStory ( no ) {
			if( this.checkLists.S.indexOf(parseInt(no)) > -1) {
				_.remove(this.checkLists.S,  n => n === parseInt(no))
			} else {
				this.checkLists.S.push( parseInt(no) )
			}
			this.$refs.storyCheckAll.$el.classList.remove('active')
			if(this.part === 'R') {
				if(this.checkLists.S.length === this.wscData.Story.length) {
					this.$refs.storyCheckAll.$el.classList.add('active')
				}
			} else {
				if(this.checkLists.S.length === this.wscData.Conv.length) {
					this.$refs.storyCheckAll.$el.classList.add('active')
				}
			}
			this.$forceUpdate()
			if(this.tabIndex == 1) {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper1.$swiper.activeIndex})
			} else {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper2.$swiper.activeIndex})
			}
		},

		onWordsCheckAll ( e ) {
			const target = e.currentTarget
			this.checkLists.W = []
			this.checkLists.Q = []
			if(target.classList.contains('active1')) {
				this.wscData.Word.forEach(( list ) => {
					this.checkLists.W.push( parseInt(list.no) )
				})
			} else if (target.classList.contains('active2')) {
				this.wscData.Word.forEach(( list ) => {
					this.checkLists.Q.push( parseInt(list.no) )
				})
			}
			this.$forceUpdate()
			if(this.tabIndex == 1) {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper1.$swiper.activeIndex})
			} else {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper2.$swiper.activeIndex})
			}
		},

		onStoryCheckAll ( e ) {
			const target = e.currentTarget
			this.checkLists.S = []
			if(target.classList.contains('active')) {
				if(this.part === 'R') {
					this.wscData.Story.forEach(( list ) => {
						if(!Array.isArray(list)) {
							this.checkLists.S.push( parseInt(list.no) )
						} else {
							this.checkLists.S.push( parseInt(list[0].no) )
						}
					})
				} else {
					this.wscData.Conv.forEach(( list ) => {
						this.checkLists.S.push( parseInt(list[0]) )
					})
				}
			}
			this.$forceUpdate()
			if(this.tabIndex == 1) {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper1.$swiper.activeIndex})
			} else {
				this.$emit('update', {checkLists: this.checkLists, tabIndex: this.tabIndex, slideIndex: this.$refs.swiper2.$swiper.activeIndex})
			}
		},

		updateData ({checkLists, tabIndex, slideIndex}) {
			this.checkLists = checkLists
			this.tabIndex = tabIndex
			this.$refs.tabMenu.changeTab( tabIndex )
			if(this.tabIndex == 1) {
				if(this.$refs.swiper1) this.$refs.swiper1.$swiper.slideTo(slideIndex, 0)
			} else {
				if(this.$refs.swiper2) this.$refs.swiper2.$swiper.slideTo(slideIndex, 0)
			}
		},

		onClose () {
			this.show = false
			this.$emit('close', this.checkLists)
		},
	}
}
</script>

<style lang="scss">
#study-point-viewer {
	position: absolute;
	left: -50%;
	top: 0;
	width: 200%;
	height: 100%;
	background-color: rgba(0,0,0,0.8);
	z-index: 1000;
	@include displayFlex;

	.viewer-wrap {
		position: relative;
		width: 1500px;
		height: 990px;
		&.disable {
			pointer-events: none;
		}
	}

	.title-con {
		position: relative;
		height: 230px;
		border-radius: 40px;
		box-sizing: border-box;
		padding: 45px 40px;
		transition: background-color 0.4s;
		&.active1 {
			background-color: #00a2d8;
		}
		&.active2 {
			background-color: #4b64d1;
		}
		.part-tit {
			position: relative;
			@include displayFlex;
			font-size: 32px;
			font-weight: 600;
			width: 404px;
			height: 48px;
			text-align: center;
			border-radius: 24px;
			color: #fff;
			background-color: rgba(0,0,0,0.4);
			padding-left: 20px;
			> span {
				margin-left: 10px; 
				font-size: 28px;
				vertical-align: middle;
			}
			&:before {
				content: '';
				position: absolute;
				left: 25px;
    			top: 12px;
				width: 24px;
				height: 24px;
				background: url('~@/assets/images/myself/pen_s_icon.png') no-repeat;
			}
			&.review {
				width: 580px;
			}
		}
		.book-tit {
			font-size: 56px;
			font-weight: 600;
			color: #fff;
			margin-top: 10px;
		}

		.tab-menu {
			position: absolute;
			right: 90px;
			top:35px;
			.btn {
				color: #fff;
				font-size: 32px;
				font-weight: 600;
				text-align: center;
				opacity: 0.4;
				transition: opacity 0.4s;
				> img {
					display: block;
					margin:0 auto 17px auto;
				}
				&:first-child {
					margin-right: 60px;
				}
				&:hover,
				&.down,
				&.active {
					opacity: 1;
				}
			}
		}
	}

	.list-con {
		width: 100%;
		height: 760px;
		position: relative;
		background-color: #eee;
		border-radius: 40px;
		
		.list-set {
			position: relative;
			top: -42px;
			left: 60px;
			width: 1380px;
			height: 720px;
			background-color: #fff;
			border-radius: 20px;
			box-shadow: 0px 3px 4px rgba(0,0,0,0.1);
		}
		.all-check {
			position: absolute;
			left: 405px;
			top: -150px;
			width: 190px;
			height: 56px;
			border-radius: 28px;
			box-sizing: border-box;
			background-color: #fff;
			box-shadow: 0px 4px 4px rgba(0,0,0,0.1);
			padding: 15px 20px;
			.btn {
				position: relative;
				top:-2px;
				> span {
					position: absolute;
					left: 43px;
					top: 0;
					font-size: 28px;
					font-weight: 600;
					width: 110px;
				}
			}
			&.review {
				left: 580px;
			}
		}
		.swiper-container {
			height: 100%;
		}
		.swiper-button-prev,
		.swiper-button-next {
			top: 350px;
			outline: none;
			width: 64px;
			height: 68px;
			&:after {
				display: none;
			}
			&.swiper-button-disabled {
				opacity: 1;
				background-position-y: -68px;
			}
		}
		.swiper-button-prev {
			left: -90px;
			background: url('~@/assets/images/common/swiper_prev.png') no-repeat;
		}
		.swiper-button-next {
			right: -90px;
			background: url('~@/assets/images/common/swiper_next.png') no-repeat;
		}
		.swiper-pagination {
			text-align: center;
			display: block;
			width: 100%;
			    bottom: -58px;
		}
		.swiper-pagination-bullet{
			margin: 0 10px;
			width: 24px;
			height: 24px;
			outline: none;
			border-radius: 50%; 
			background-color: #222;
		}

		.list-set {
			.check {
				display: inline-block;
				width: 32px;
				height: 32px;
				vertical-align: middle;
				background: url("~@/assets/images/myself/check_box.png") no-repeat;
				&.active,
				&.active1 {
					background-position-y: -32px;
				}
				&.active2 {
					background-position-y: -64px;
				}
				&.disable {
					pointer-events: none;
				}
			}
			&.w {
				padding-top: 10px;
				.list {
					padding: 22px 60px;
					border-top: dashed 2px #eee;
					&:first-child {
						border-top: none;
					}
					> span {
						font-size: 36px;
						font-weight: 500;
						width: 598px;
						display: inline-block;
						vertical-align: middle;
					}
					.check {
						margin-left: 2px;
						margin-right: 28px;
					}
				}
			}
			&.s {
				.list {
					position: relative;
					padding: 30px 60px;
					height: 360px;
					border-top: dashed 2px #eee;
					&:first-child {
						border-top: none;
					}
					.thumb {
						width: 368px;
    					height: 294px;
						border: solid 2px #eee;
						border-radius: 16px;
						overflow: hidden;
						> img {
							object-fit: cover;
						}
					}	

					.text-con {
						position: absolute;
    					left: 465px;
    					top: 55px;
					}

					

					.text-list {
						@include displayFlex(flex-start, flex-start);
						margin-top: 45px;
						&:first-child {
							margin-top: 0;
						}
						.btn {
							margin-top: 5px;
							vertical-align: middle;
						}
						.text {
							margin-left: 20px;
							width: 850px;
							> p{
								font-size: 36px;
								font-weight: 500;
								margin-top: 10px;
								&:first-child {
									margin-top: 0;
								}
							}
						}
					}
					
				}
				.list.noimage .text-con {
					left: 60px;
					width: calc(100% - 120px);
					.text {
						width: 1190px;
					}
				}
			}

			&.c {
				position: relative;
				.thumb {
					position: absolute;
					left: 64px;
					top: 212px;
					width: 368px;
					height: 294px;
					border: solid 2px #eee;
					border-radius: 16px;
					overflow: hidden;
					> img {
						object-fit: cover;
					}
				}	
				.list-wrap {
					padding-left: 470px;
					box-sizing: border-box;
				}
				.list {
					position: relative;
					padding-top: 45px;
    				height: 180px;
					border-top: dashed 2px #eee;
					&:first-child {
						border-top: none;
					}
					@include displayFlex(flex-start, flex-start);
				}
				.text-con {
					margin-left: 20px;
					width: 790px;
					.text {
						font-size: 36px;
						font-weight: 500;
						margin-top: 10px;
						&:first-child {
							margin-top: 0;
						}
					}
				}
			}

			&.c-review {
				.list {
					position: relative;
					padding: 30px 60px;
					height: 360px;
					border-top: dashed 2px #eee;
					&:first-child {
						border-top: none;
					}
					.thumb {
						width: 368px;
    					height: 294px;
						border: solid 2px #eee;
						border-radius: 16px;
						overflow: hidden;
						> img {
							object-fit: cover;
						}
					}

					.text-con {
						position: absolute;
    					left: 465px;
    					top: 45px;
						width: 848px;
					}	
					.ko {
						padding-bottom: 10px;
						margin-bottom: 10px;
						color: #008fbf;
						font-size: 36px;
						font-weight: 600;
						> span {
							display: inline-block;
							padding: 17px 20px;
							background-color: #006a80;
							color: #fff;
							text-align: center;
							border-radius: 10px;
							font-size: 32px;
							font-weight: 600;
							line-height: 16px;
							margin-right: 15px;
							vertical-align: middle;
							margin-top: -2px;
						}
					}
					.en {
						@include displayFlex(flex-start, flex-start);
						width: 848px;
						height: 210px;
						background-color: #ebfcff;
						border-radius: 20px;
						padding: 28px;
						.text {
							margin-left: 20px;
							margin-top: -2px;
							width: 740px;
							> p{
								font-size: 36px;
								font-weight: 500;
								margin-top: 10px;
								&:first-child {
									margin-top: 0;
								}
							}
						}
					}
				}
				
				
			}
		}
	}

	.close-btn {
		position: absolute;
		right: -20px;
		top: -20px;
		width: 96px;
		height: 100px;
		background: url('~@/assets/images/common/pop_close.png') no-repeat;
	}
}
</style>