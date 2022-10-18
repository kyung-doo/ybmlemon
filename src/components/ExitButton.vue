<template>
	<ui-button @button:click="onCloseWindow" class="exit-btn" title="닫기" />
</template>

<script>
import { LocalRecorder } from '@/libs/recorderService'
export default {
	name: 'exitButton',

	methods: {
		onCloseWindow ( e ) {
			if(LocalRecorder.isRecording) {
				this.$confirm({
					message: '진행중인 녹화가 있습니다.<br />녹화를 종료하고 저장합니다.',
					submessage: 'There is a recording in progress.<br />The recording will end and be saved.',
					button: [
						{ name: '확인' } 
					],
					callback: () => {
						LocalRecorder.stopRecord();
					}
				})
			} else {
				this.$confirm({
					message: '정말 나가시겠습니까?',
					submessage: 'Are you sure you want to exit?',
					button: [
						{ name: '취소', value: false },
						{ name: '확인', value: true } 
					],
					callback: (confirm) => {
						if(confirm) self.close()
					}
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.exit-btn {
	position: absolute;
	right: 25px;
	top: 23px;
	width: 66px;
	height: 67px;
	background: url('~@/assets/images/common/exit_btn.png') no-repeat;
	z-index: 999;
	&.down,
	&:hover {
		background-position-y: -67px;
	}
}
</style>