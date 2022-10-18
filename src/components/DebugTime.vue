<template>
	<div id="debug-time">
		<div class="now-time">
			<strong>현재 시간:</strong> {{nowTime}},<br />
			<strong>프리 시작 시간 :</strong> {{classPreTime}},<br />
			<strong>수업 시작 시간 :</strong> {{classStartTime}},<br />
			<strong>수업 종료 시간 :</strong> {{classEndTime}}<br />
			<strong>현재 시간 재설정: <input ref="resetNow" type="time" @change="onResetNowTime"></strong>
		</div>
	</div>
</template>

<script>
import { gsap, Cubic } from 'gsap'
import { Draggable } from "gsap/Draggable" 

export default {
	name: 'debugTime',

	data () {
		return {
			nowTime: this.$dateformat(this.$eventBus.now, 'mm-dd HH:MM:ss'),
		}
	},

	computed: {
		classPreTime () {
			return this.$dateformat(this.studyInfo.preStartTime, 'mm-dd TT hh:MM:ss')
		},
		classStartTime () {
			return this.$dateformat(this.studyInfo.classStartTime, 'mm-dd TT hh:MM:ss')
		},
		classEndTime () {
			return this.$dateformat(this.studyInfo.classEndTime, 'mm-dd TT hh:MM:ss')
		}
	},
	
	mounted() {
		this.$eventBus.$on('timeupdate', this.onTimeupdate)
		this.$refs.resetNow.value = this.$dateformat(this.nowTime, 'HH:MM')
		Draggable.create(this.$el, {
			type: 'x,y',
			bounds: '#scale-layer'
		})
	},

	beforeDestroy() {
		this.$eventBus.$off('timeupdate', this.onTimeupdate)
	},
	

	methods: {
		onTimeupdate ( now ) {
			this.nowTime = this.$dateformat(now, 'mm-dd TT hh:MM:ss')
			this.$forceUpdate()
		},
		onResetNowTime () {
			this.$emit('reset-now-time', this.$refs.resetNow.value)
		}
	}
}
</script>

<style lang="scss" scoped>
#debug-time{
	position: fixed;
	left:0px;
	bottom: 0px;
	background-color: #fff;
	padding: 10px;
	border: solid 1px #ccc;
	z-index: 9999;
	opacity: 0.8;
	strong {
		font-weight: 900;
		color: #000;
	}
	input {
		pointer-events: all;
	}
}
</style>