<template>
	<div class="volume-con" @mouseenter="onEnterVolume" @mouseleave="onLeaveVolume">

		<ui-button 
			type="div"
			ref="volumeBtn"
			class="volume-btn"
			:toggle="true"
			@button:click="onClickVolume" />

		<vue-range-slider 
			:style="{'visibility': showSlider ? 'visible' : 'hidden'}"
			class="volume-slider" 
			ref="volumeSlider" 
			tooltip="hover"
			:value="volume" 
			:width="66"
			:dot-width="11"
			:dot-height="18"
			@slide-end="changeVolume"
			@drag-end="setVolume" />
		
	</div>
</template>

<script>

export default {
	name: 'volumeButton',

	data () {
		return {
			showSlider: false,
			timer: null
		}
	},

	computed: {
		volume () {
			return this.$store.getters['study/mainStudy/getVolume']
		}
	},

	methods: {
		onEnterVolume () {
			clearTimeout(this.timer)
		},

		onLeaveVolume () {
			this.timer = setTimeout(() => {
				this.showSlider = false
				this.$refs.volumeBtn.$el.classList.remove('active')
			}, 1000)
		},

		onClickVolume () {
			if(this.$refs.volumeBtn.$el.classList.contains('active')) {
				this.showSlider = true
				this.$refs.volumeSlider.refresh()
			} else {
				this.showSlider = false
			}
		},

		changeVolume ( val ) {
			this.$emit('change-volume', val)
			if(val === 0) {
				this.$refs.volumeBtn.$el.classList.add('mute')
			} else {
				this.$refs.volumeBtn.$el.classList.remove('mute')
			}
		},

		setVolume ( e ) {
			if(e.val > 0) {
				this.$store.dispatch('study/mainStudy/setVolume', e.val)
			}
		}
	}
}
</script>

<style lang="scss">
.volume-con {
	position: relative;
	display: inline-block;
	vertical-align: middle;
	margin: 0 8px;
	.volume-btn {
		display: inline-block;
		width: 38px;
		height: 35px;
		background: url('~@/assets/images/study/vol_icon.png') no-repeat;
		vertical-align: middle;
		&.mute {
			background-position-y: -35px;
		}
	}
	.vue-range-slider.slider-component {
		position: absolute;
		left: -14px;
    	top: 30px;
		width: 66px;
		height: 9px;
		display: inline-block;
		vertical-align: middle;
		cursor: pointer;
		&:before{
			content: '';
			width: 63px;
			height: 14px;
			background-color: #97a1af;
			position: absolute;
			left: 2px;
			top: 5px;
			border-radius: 7px;
		}
		.slider-dot-handle {
			border-radius: 5px !important;
			background-color: #f00 !important;
		}
		.slider {
			background-color: #000 !important;
		}
		.slider-process {
			background-color: #ffce25 !important;
		}
	}
}

</style>