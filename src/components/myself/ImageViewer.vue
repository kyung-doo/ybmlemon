<template>
	<div id="image-viewer" v-show="show">
		<transition name="transition-up">
			<div :class="['viewer-wrap', remote ? 'disable':'']" v-if="show">

				<!-- title-con -->
				<div v-if="imageList.ucode" class="title-con">
					<div class="title">{{imageList.ucode}}</div>
					<div class="text" v-for="(text, i) in imageList.bookCodes" :key="i">
						[ {{ text }} ]
					</div>
				</div>
				<!-- //title-con -->

				<swiper ref="swiper"
					class="swiper" 
					:options="{ 
						observer: true, 
						speed: 0,
						navigation: { nextEl: '#image-viewer .swiper-button-next', prevEl: '#image-viewer .swiper-button-prev' },
						pagination: { el: '#image-viewer .swiper-pagination', clickable: true },
						on: {slideChange: onSlideChange}
					}">
					<swiper-slide class="swiper-no-swiping" v-for="(image, i) in imageList.images" :key="i">

						<!-- map-con -->
						<div class="map-con">
							<div class="map-wrap" :ref="'mapWrap'+i">
								<img :ref="'mapImg'+i" :src="`${$config.LMS_URL}${image}`"  />
								<div class="map-mask" :ref="'mapMask'+i">
									<img :ref="'maskImg'+i" :src="`${$config.LMS_URL}${image}`"  />
								</div>
							</div>
						</div>
						<!-- //map-con -->

						<!-- image-con -->
						<div class="image-con">
							<smooth-scrollbar :ref="'scrollBar'+i">
								<img :ref="'img'+i" :src="`${$config.LMS_URL}${image}`" @load="loadedImage(i)" />
							</smooth-scrollbar>
						</div>
						<!-- //image-con -->

					</swiper-slide>
				</swiper>

				<div v-show="imageList.images.length > 1" class="swiper-navi">
					<div class="swiper-button-next"></div>
					<div class="swiper-button-prev"></div>
					<div class="swiper-pagination"></div>
				</div>

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

import { gsap } from 'gsap'
import { Draggable } from "gsap/Draggable" 
import { Swiper, SwiperSlide, directive } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'

export default {
	name: 'imageViewer',

	components: {
      Swiper,
      SwiperSlide
   },

	props: {
		imageList: {
			ucode: '',
			bookCodes: [],
			images: []
		},
		remote: false
	},

	data() {
		return {
			show: false,
			Swiper
		}
	},

	watch: {
		show ( newVal ) {
			if(!newVal) {
				for(let i=0; i<this.imageList.images.length; i++) {
					const scrollBar = this.$refs['scrollBar'+i][0]
					scrollBar.scrollbar.destroy()
					scrollBar.scrollbar = null
					scrollBar.$options.destroyed = () => {}
				}
			}
		}
	},

	methods: {
		loadedImage( idx ) {	
			var timer
			if(this.$refs['img'+idx][0].offsetHeight > this.$refs['scrollBar'+idx][0].$el.offsetHeight) {
				this.$refs['mapWrap'+idx][0].style.height = (this.$refs['mapImg'+idx][0].offsetHeight-4) + 'px'
				
				const onScroll = ( e ) => {
					const percent = e.offset.y / (this.$refs['img'+idx][0].offsetHeight - this.$refs['scrollBar'+idx][0].$el.offsetHeight)
					const mapPosition = (this.$refs['mapImg'+idx][0].offsetHeight - this.$refs['mapMask'+idx][0].offsetHeight) *percent
					gsap.set(this.$refs['mapMask'+idx][0], {y: mapPosition})
					gsap.set(this.$refs['maskImg'+idx][0], {y: -mapPosition})
					if(!this.remote) {
						clearTimeout( timer )
						timer = setTimeout(() => {
							this.$emit('scroll', percent)
						}, 100)
					}
				}

				this.$refs['scrollBar'+idx][0].scrollbar.addListener(onScroll)
				
				Draggable.create(this.$refs['mapMask'+idx][0], {
					type: 'y',
					bounds: this.$refs['mapWrap'+idx][0],
					minY: 0,
					maxY: this.$refs['mapWrap'+idx][0].style.height,
					onDrag: ( e ) => {
						const percent = parseFloat(this.$refs['mapMask'+idx][0]._gsap.y) / (this.$refs['mapImg'+idx][0].offsetHeight - this.$refs['mapMask'+idx][0].offsetHeight)
						const scrollPosition = (this.$refs['img'+idx][0].offsetHeight - this.$refs['scrollBar'+idx][0].$el.offsetHeight) * percent
						this.$refs['scrollBar'+idx][0].scrollbar.scrollTop = scrollPosition
					}
				})
				setTimeout(()=>{
					this.$refs['scrollBar'+idx][0].scrollbar.scrollTop = 0.1
					this.$refs['scrollBar'+idx][0].scrollbar.update()
				}, 100)
			} else {
				this.$refs['mapWrap'+idx][0].parentNode.classList.add('no-scroll')
				this.$refs['scrollBar'+idx][0].$el.parentNode.classList.add('no-scroll')
				this.$refs['scrollBar'+idx][0].scrollbar.destroy()
			}
			if(this.remote) {
				this.$emit('image-loaded', idx)
			}	
		},

		onSlideChange () {
			const idx = this.$refs.swiper.$swiper.activeIndex
			this.$refs['scrollBar'+idx][0].scrollbar.scrollTop = 0
			gsap.set(this.$refs['mapMask'+idx][0], {y: 0})
			gsap.set(this.$refs['maskImg'+idx][0], {y: 0})
		},

		onClose () {
			this.show = false
			this.$emit('close')
		},

		updateScroll ( scrollY ) {
			const scrollPosition = (this.$refs.img0[0].offsetHeight - this.$refs.scrollBar0[0].$el.offsetHeight) * scrollY
			this.$refs.scrollBar0[0].scrollbar.scrollTop = scrollPosition 
			const mapPosition = (this.$refs.mapImg0[0].offsetHeight - this.$refs.mapMask0[0].offsetHeight) * scrollY
			gsap.set(this.$refs.mapMask[0], {y: mapPosition})
			gsap.set(this.$refs.maskImg[0], {y: -mapPosition})
		}
	}
}
</script>

<style lang="scss">
#image-viewer {
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
		background-color: #00a2d8;
		border-radius: 40px;
		&.disable {
			pointer-events: none;
		}
	}

	.swiper-container{
		box-sizing: border-box;
		height: 100%;
	}

	.swiper-navi {
		position: absolute;
		left: 15px;
		bottom: 40px;
		width: 250px;
		text-align: center;
	}

	.swiper-pagination {
		display: inline-block;
		position: relative;
	}
	.swiper-pagination-bullet {
		width: 16px;
		height: 16px;
		margin: 0 7px;
		background-color: #222;
	}

	.swiper-button-prev,
	.swiper-button-next {
		top: -445px;
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
		left: -110px;
		background: url('~@/assets/images/common/swiper_prev.png') no-repeat;
	}
	.swiper-button-next {
		right: -1330px;
		background: url('~@/assets/images/common/swiper_next.png') no-repeat;
	}

	.image-con {
		position: absolute;
		left: 280px;
		top: 0;
		width: 1220px;
		height: 100%;
		border-radius: 40px;
		overflow: hidden;
		background-color: #fff;
		img {
			width: 100%;
			height: auto;
		}
		&.no-scroll {
			.smooth-scrollbar {
				@include displayFlex;
			}
		}
		.scroll-content {
			height: 0;
		}
		&:after {
			content: '';
			display: block;
			position: absolute;
			left:0;
			top: 0;
			width: 100%;
			height: 100%;
			border: solid 10px #fff;
			border-radius: 40px;
			pointer-events: none;
		}
		.scrollbar-track-y {
			right: 20px;
			transform: scaleY(0.9);
		}
	}

	.map-con {
		position: absolute;
		left: 34px;
		width: 212px;
		height: 100%;
		@include displayFlex;
		.map-wrap {
			position: relative;
			box-sizing: border-box;
			background-color: #fff;
			&:before {
				content: '';
				position: absolute;
				left: -4px;
				top: -4px;
				width: calc(100% + 8px);
				height: calc(100% + 8px);
				border: solid 4px #eee;
				border-radius: 10px;
			}
			&:after{
				content:'';
				width: 100%;
				height: 100%;
				position: absolute;
				left:0;
				top:0;
				width: 100%;
				height: 100%;
				background-color: rgba(0,0,0,0.4);
				border-radius: 5px;
			}
			img {
				width: 100%;
				height: auto;
				border-radius: 5px;
				vertical-align: middle;
			}
			.map-mask {
				position: absolute;
				left:0;
				top:0;
				width: 100%;
				height: 152px;
				z-index: 3;
				overflow:hidden;
				border-radius: 5px;
				&:after {
					content: '';
					position: absolute;
					left:0;
					top:0;
					width: 100%;
					height: 100%;
					pointer-events: none;
					border: solid 3px #fff952;
				}
			}
		}
		&.no-scroll {
			.map-wrap:after {
				display: none;
			}
			.map-mask {
				display: none;
			}
		}
		
	}

	.title-con {
		position: absolute;
		left: 30px;
		top: 80px;
		width: 220px;
		text-align: center;
		.title {
			font-size: 40px;
			font-weight: 600;
			color: #fff;
			margin-bottom: 20px;
		}
		.text {
			width: 220px;
			height: 48px;
			border-radius: 24px;
			background-color: #006182;
			color: #fff;
			text-align: center;
			font-size: 28px;
			font-weight: 500;
			line-height: 48px;
			margin-top: 10px;
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
</style>