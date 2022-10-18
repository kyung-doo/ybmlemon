<template>
	<div id="buzzer-view" v-show="isShow">
		<div class="buzzer-wrap" v-show="isShow">
			<ui-sequence
				ref="sequence" 
				source="buzzer"
				name="buzzer_"
				:total-frames="60"
				:fps="30"
				:loop="false"
				@finish="stop">
			</ui-sequence>
		</div>
	</div>
</template>

<script>

import AudioControl from '@/libs/audioControl'

export default {
	name: 'buzzerView',
	
	data () {
		return {
			isShow: false,
			buzzerAudio: null
		}
	},

	mounted () {
		this.buzzerAudio = new AudioControl('buzzer.mp3')
	},

	beforeDestroy() {
		this.buzzerAudio.destroy()
	},

	methods: {
		start () {
			this.stop()
			this.isShow = true
			this.$refs.sequence.gotoAndPlay(1)
			setTimeout(()=> {
				this.buzzerAudio.play()
			}, 300)
			this.$emit('start')
		},

		stop () {
			this.isShow = false
			this.buzzerAudio.stop()
			this.$emit('finish')
		}
	}
}
</script>

<style lang="scss">
#buzzer-view{
	position: absolute;
	left: 0;
	top: 0;
	@include fullSize;
	.buzzer-wrap {
		position: absolute;
		left: 940px;
    	top: 420px;
		width: 325px;
		height: 325px;
	}
}
</style>