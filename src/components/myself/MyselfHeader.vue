<template>
	<div id="myself-header">
		<div class="header-wrap">
			<div class="main-title">자기주도학습</div>
			<div class="sub-title">
				<img :src="titleImage" />
				{{titleTxt}}
			</div>
		</div>
		<home-button />
		<exit-button />
	</div>
</template>

<script>

export default {
	name: 'myselfHeader',

	props: {
		titleImg: { type: String, default: ''},
		titleTxt: { type: String, default: ''}
	},

	computed: {
		titleImage () {
			return require('@/assets/images/myself/' + this.titleImg)
		}
	}
}
</script>

<style lang="scss">
#myself-header {
	position: absolute;
	left:0;
	top:0;
	width: 100%;
	height: 220px;
	.header-wrap {
		position: absolute;
		left: -50%;
		top: 0;
		width: 200%;
		height: 100%;
		background-color: #006073;
		&:before {
			content: '';
			position: absolute;
			left: 0;
			top: 96px;
			width: 100%;
			height: 4px;
			background-color: #004d5c;
		}
	}

	.main-title {
		width: 1852px;
		margin: 0 auto;
		padding: 28px;
		color: #fff;
		font-size: 36px;
		font-weight: 600;
	}
	.sub-title {
		width: 1852px;
		margin: 0 auto;
		padding-left: 28px;
		color: #fff;
		font-size: 48px;
		font-weight: 600;
		height: 123px;
		@include displayFlex(center, flex-start);
		> img {
			margin-right: 30px;
		}
	}
}
</style>