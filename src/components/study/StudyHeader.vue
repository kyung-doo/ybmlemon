<template>
	<div id="study-header" v-if="classType" :class="classType">
		<div :class="['level', 'L'+level]"><span></span></div>
		<div class="info-con">
			<div class="part-day" v-html="partDay"></div>
			<div :class="['book', 'L'+level]" v-html="bookTitle"></div>
		</div>
		<div class="main-title" v-if="classType === 'main-class'" v-html="this.Btitle"></div>
		<div class="sub-title pre" v-if="classType === 'pre-class'"></div>
		<div class="sub-title after" v-if="classType === 'after-class'"></div>
		<div class="sub-title homework" v-if="classType === 'homework-on'"></div>
	</div>
</template>

<script>

export default {
	name: 'studyHeader',

	props: {
		level: { type: String, default: ''},
		part: { type: String, default: ''},
		day: { type: String, default: ''},
		Bcode: { type: String, default: ''},
		Bno: { type: String, default: ''},
		Lno: { type: String, default: ''},
		Btitle: { type: String, default: ''}
	},

	data () {
		return {
			classType: this.getClassType()
		}
	},

	computed: {
		bookTitle () {
			if(this.Btitle.indexOf('Review') > -1) {
				return 'Review'
			} else if(this.Btitle.indexOf('A-Test') > -1) {
				if(this.currentOwner === 'KT') return 'A-Test'
				else                   			 return 'SCF-AT'
			}
			return `${this.Bcode} <span>${this.Bno}</span>-${this.Lno}`
		},
		
		partDay () {
			return `${this.level}${this.part}-Day <strong>${this.day}</strong>`
		},

		currentOwner () {
			return this.$store.getters['study/mainStudy/getOwner']
		},
	},

	watch: {
		'$route' () {
			this.classType = this.getClassType()
		}
	},

	methods: {
		getClassType () {
			switch( this.$router.currentRoute.name ) {
				case 'PreStudy' : return 'pre-class'
				case 'MainStudy' : return 'main-class'
				case 'AfterStudy' : return 'after-class'
				case 'HomeworkOn' : return 'homework-on'
				default : return ''
			}
		}
	}
}
</script>

<style lang="scss">
#study-header {
	@include displayFlex(center, flex-start);
	position: absolute;
	left: 30px;
	top: 0;
	height: 104px;
	pointer-events: none;
	
	.level {
		@include displayFlex(center, flex-start);
		width: 33px;
		height: 100%;

		> span {
			display: inline-block;
			width: 21px;
			height: 57px;
			vertical-align: middle;
			border-radius: 10px;
			background-color: #FF0000;
		}

	}
	.info-con {
		position: relative;
		height:100%;
		.part-day {
			@include displayFlex(flex-end, flex-start);
			height: 50%;
			box-sizing: border-box;
			font-weight: 600;
			font-size: 28px;
			color: #2e3192;
			> strong {
				font-weight: 600;
				font-size: 28px;
				color: #297ae2;
				margin-left: 5px;
			}
		}
		.book {
			@include displayFlex(flex-start, flex-start);
			height: 50%;
			font-weight: 600;
			font-size: 28px;
			box-sizing: border-box;
			padding-top: 2px;
			color: lighten(#ff0000, 15%);
			> span {
				display: inline-block;
				padding: 2px 6px 0px 6px;
				color: #fff;
				border-radius: 12px;
				vertical-align: middle;
				margin: 0 5px;
				font-size: 23px;
				background-color: lighten(#ff0000, 15%);
			}
		}
		span {
			font-weight: bold;
		}
	}

	&.main-class .info-con:after {
		content: '';
		width: 6px;
		height: 100%;
		background: url('~@/assets/images/common/header_dot.png') no-repeat center;
		display: inline-block;
		position: absolute;
		top: 0;
		right: -20px;
	}

	.main-title {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		height: 100%;
		font-weight: 800;
		font-size: 58px;
		float: left;
		color: #1b3783;
		margin-left: 35px;
		>span {
			font-weight: 800;
		}

	}

	.sub-title {
		width: 154px;
		height: 57px;
		margin-left: 20px;
		&.pre {
			background: url('~@/assets/images/study/pre_title.png') no-repeat;
		}
		&.after {
			background: url('~@/assets/images/study/after_title.png') no-repeat;
		}
		&.homework {
			background: url('~@/assets/images/study/homework_title.png') no-repeat;
		}
	}
	
}
</style>