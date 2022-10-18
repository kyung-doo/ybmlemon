<template>
	<ui-button @button:click="onClickHome" class="home-btn" title="홈으로" />
</template>

<script>
export default {
	name: 'homeButton',

	methods: {
		onClickHome ( e ) {
			this.$router.push({name: 'Home'})
		}
	}
}
</script>

<style lang="scss" scoped>
.home-btn {
	position: absolute;
	right: 105px;
   top: 25px;
	width: 63px;
	height: 63px;
	background: url('~@/assets/images/common/home_btn.png') no-repeat;
	z-index: 999;
	&.down,
	&:hover {
		background-position-y: -63px;
	}
}
</style>