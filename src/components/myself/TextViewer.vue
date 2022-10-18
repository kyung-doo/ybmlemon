<template>
	<div id="text-viewer" v-show="show">
		<transition name="transition-up">
			<div :class="['viewer-wrap', remote ? 'disable':'']" v-if="show">

				<!-- top-title -->
				<div class="top-title">
					<h2 v-if="viewerType === 'note' && !editMode">학습노트 내용</h2>
					<h2 v-if="viewerType === 'note' && editMode">학습노트 작성</h2>
					<h2 v-if="viewerType === 'qna' && !editMode">학습Q&A 내용</h2>
					<h2 v-if="viewerType === 'qna' && editMode">학습Q&A 작성</h2>
					<h2 v-if="viewerType === 'download'">학습자료실</h2>
				</div>
				<!-- //top-title -->

				<!-- view-con -->
				<div v-if="!editMode" :class="['view-con', viewerType]">
					<smooth-scrollbar ref="scrollBar">
						<!-- title-con -->
						<div class="title-con">
							<div class="part" v-html="partTitle"></div>
							<div class="title">{{viewerData.subject}}</div>
						</div>
						<!-- //title-con -->

						<!-- content-note -->
						<div v-if="viewerType === 'note'" class="content-note">
							<div ref="contentText" class="content-text" v-html=contentStr />
						</div>
						<!-- //content-note -->

						<!-- content-qna -->
						<div v-if="viewerType === 'qna'" class="content-qna">
							<div ref="contentText" class="content-question">
								<div v-html="questionStr" />
							</div>
							<div :class="['content-answer', viewerData.is_reply && parseInt(viewerData.is_reply) !== 0 ? '':'no-answer']">
								<div v-html="answerStr" />
							</div>
						</div>
						<!-- //content-qna -->

						<!-- content-download -->
						<div v-if="viewerType === 'download'" class="content-download">
							<div ref="contentText" class="content-text">
								<div v-html="contentStr" />
							</div>
							<div class="content-files" v-if="viewerData.Files.length > 0">
								<ul> 
									<li v-for="(file, i) in viewerData.Files" :key="i" >
										<ui-button
											type="a"
											@button:click="onClickDownload(file.filename, file.path)">
											{{file.filename}}
										</ui-button>
									</li>
								</ul>
							</div>
						</div>
						<!-- //content-download -->
					</smooth-scrollbar>
				</div>
				<!-- //view-con -->
				
				<!-- edit-con -->
				<div v-else class="edit-con">
					<!-- title-con -->
					<div class="title-con">
						<div class="part">
							<span class="tit">학습 진도</span>
							<span class="select-con">
								<select class="level-select" v-model="levelSelected">
									<option v-for="(opt, index) in levelOpt" :key="index" :value="opt.value">{{opt.name}}</option>
								</select>
							</span>
							<span class="select-con">
								<select class="part-select" v-model="partSelected">
									<option value="R">Reading</option>
									<option value="S">Speaking</option>
								</select>
							</span>
							<span class="select-con">
								<select class="day-select" v-model="daySelected" @change="onChangeDay">
									<option v-for="(opt, index) in dayOpt" :key="index" :value="opt.value">{{opt.name}}</option>
								</select>
							</span>
							<span class="select-con">
								<select class="title-select" v-model="titleSelected" @change="onChangeTitle">
									<option v-for="(opt, index) in titleOpt" :key="index" :value="opt.value">{{opt.name}}</option>
								</select>
							</span>
							<label>
								<input type="checkbox" v-model="defaultPartChk">
								<span></span>기본선택
							</label>
						</div>
						<div class="title">
							<input ref="editTitle" type="text" v-model="editTitle">
							<div class="right-check">
								<label>
									<input type="checkbox" v-model="titleToPartChk">
									<span></span>제목을 진도명으로
								</label>
							</div>
						</div>
					</div>
					<!-- //title-con -->
					<!-- content -->
					<div class="content">
						<textarea ref="editContent" class="content-text" v-model="editContent" />
					</div>
					<!-- //content -->
				</div>
				<!-- //edit-con -->

				<!-- bottom-con -->
				<div class="bottom-con">
					<div :style="{'text-align': !useEditMode || viewerType === 'download' ? 'center' : 'left'}">
						<ui-button
							v-if="viewerMode !== 'edit' && !remote"
							class="close-btm-btn"
							@button:click="onClose">
							닫기
						</ui-button>
						<div v-if="useEditMode" :class="viewerMode !== 'edit' ? 'right' : 'center'">
							<ui-button v-if="(!editMode && viewerType === 'note') || (!editMode && viewerType ==='qna' && parseInt(viewerData.is_reply) === 0)" 
								class="modify-btn"
								@button:click="onModify">
								수정
							</ui-button>
							<ui-button v-if="!editMode && viewerType !== 'download'" 
								class="delete-btn"
								@button:click="onDelete">
								삭제
							</ui-button>

							
							<ui-button v-if="editMode" 
								class="cancel-btn"
								@button:click="onCancel">
								취소
							</ui-button>
							<ui-button v-if="editMode" 
								class="enter-btn"
								@button:click="onEnter">
								확인
							</ui-button>
						</div>
					</div>
				</div>
				<!-- //bottom-con -->


				<!-- close-btn -->
				<ui-button v-if="!remote"
					class="close-btn" 
					title="닫기" 
					@button:click="onClose">
				</ui-button>
				<!-- //close-btn -->

			</div>
		</transition>
	</div>
</template>

<script>

import _ from 'lodash'
import download from 'downloadjs'

export default {
	name: 'textViewer',

	props: {
		initData: { type: Object, default: null },
		viewerType: { type: String, default: 'note' },
		viewerMode: { type: String, default: 'view' },
		useEditMode: { type: Boolean, default: true },
		remote: { type: Boolean, default: false }
	},

	data() {
		return {
			show: false,
			viewerData: null,
			editMode: false,
			levelOpt: [],
			dayOpt: [],
			titleOpt:[],
			levelSelected: 1,
			partSelected: 'R',
			daySelected: 1,
			titleSelected: 1,
			defaultPartChk: true,
			titleToPartChk: false,
			isDefault: false,
			isTitleToPart: false,
			editTitle: '',
			editContent: ''
		}
	},

	computed: {
		hmwkOffUcode () {
			const latestHwmkOff = this.$store.getters['myself/getLatestHomeworkOff']
			return latestHwmkOff ? latestHwmkOff[1] : 'L1_R1'
		},
		
		contentStr () {
			return this.viewerData.comment.replace(/(?:\r\n|\r|\n)/g, '<br>')
		},
		
		questionStr () {
			return this.viewerData.comment.replace(/(?:\r\n|\r|\n)/g, '<br>')
		},
		
		answerStr () {
			if(this.viewerData.reply && this.viewerData.reply !== '') {
				return this.viewerData.reply.replace(/(?:\r\n|\r|\n)/g, '<br>')
			} else {
				return '답변을 준비하고 있습니다.'
			}
		},

		partTitle () {
			if(this.viewerType !== 'download') {
				return `${this.viewerData.level}${this.viewerData.part}-Day${this.viewerData.day}<span>[${this.viewerData.Bcode} ${this.viewerData.Bno}-${this.viewerData.Lno}st]</span>`
			} else {
				return `${this.viewerData.level}${this.viewerData.part}-Day${this.viewerData.day}<span>[${this.viewerData.Bcode} ${this.viewerData.Bno}-${this.viewerData.Lno}st : ${this.viewerData.book_title}]</span>`
			}
		}
	},

	watch: {
		show ( newVal ) {
			if(newVal) {
				this.viewerData = _.cloneDeep(this.initData)
				this.editMode = this.viewerMode === 'edit'
				if(this.editMode) {
					this.setDefaultCheck(this.hmwkOffUcode)
					this.titleToPartChk = false
					this.editTitle = ''
					this.editContent = ''
				}
				
				setTimeout(() => {
					var timer= null
					if(this.$refs.scrollBar) {
						this.$refs.scrollBar.scrollbar.addListener(( e ) => {
							if(!this.remote) {
								const percent = e.offset.y / (this.$refs.contentText.offsetHeight - this.$refs.scrollBar.$el.offsetHeight)
								clearTimeout( timer )
								timer = setTimeout(() => {
									this.$emit('scroll', percent)
								}, 100)
							}
						})
					}
				})
			} else {
				if(this.$refs.scrollBar && this.$refs.scrollBar.scrollbar) {
					this.$refs.scrollBar.scrollbar.destroy()
					this.$refs.scrollBar.$options.destroyed = () => {}
					this.$refs.scrollBar = null
				}
			}
		},

		levelSelected() {
			if(!this.isDefault) {
				this.setDayNum()
				this.setBookTitle()
				this.defaultPartChk = false
			}
			if(this.titleToPartChk) {
				this.setTitleToPart()
			}
		},

		partSelected() {
			if(!this.isDefault) {
				this.setDayNum()
				this.setBookTitle()
				this.defaultPartChk = false
			}
			if(this.titleToPartChk) {
				this.setTitleToPart()
			}
		},

		defaultPartChk ( newVal ) {
			if(this.editMode && newVal) {
				if(!this.viewerData) {
					this.setDefaultCheck(this.hmwkOffUcode)
				} else {
					this.setDefaultCheck(this.viewerData.u_code)
				}
			}
		},

		titleToPartChk ( newVal ) {
			if(this.editMode && newVal) {
				this.setTitleToPart()
			}
		},

		editTitle () {
			if(!this.isTitleToPart) {
				this.titleToPartChk = false
			}
		}
	},

	mounted() {
		for( let i=0; i<7; i++) {
			this.levelOpt.push({name: `Level ${i+1}`, value: i+1})
		}
		this.setDayNum()
		this.setBookTitle()
	},

	methods: {

		listPart ( level, part, day ) {
			return `${level}${part}-Day${day} [${LM.returnBookCode(level, part, day).replace('_', ' ')}]`
		},

		onModify () {
			this.editMode = true
			this.editTitle = this.viewerData.subject
			this.editContent = this.viewerData.comment
			this.titleToPartChk = false
			this.setDefaultCheck(`L${this.viewerData.level}_${this.viewerData.part}${this.viewerData.day}`)
		},

		onDelete () {
			this.$confirm({
				message: '현재글을 삭제하시겠습니까?',
				button: [
					{ name: '취소', value: false },
					{ name: '확인', value: true } 
				],
				callback: async (confirm) => {
					if(confirm){
						let url
						if(this.viewerType === 'note') 		url = `${this.$config.LMSApiURL}/setStdNote-del`
						else if(this.viewerType === 'qna') 	url = `${this.$config.LMSApiURL}/setStdQna-del`

						await this.$http.post(url, { 
							mem_id: this.userInfo.id,
							list_id: this.viewerData.list_id
						})
						this.show = false
						this.$emit('update-list', 'delete')
					}
				}
			})
		},

		async onEnter () {
			if(this.editTitle.length === 0) {
				this.$confirm({
					message: '제목을 입력하세요.',
					button: [
						{ name: '확인' } 
					],
					callback: () => {
						this.$refs.editTitle.focus()
					}
				})
				return
			}

			if(this.editContent.length === 0) {
				this.$confirm({
					message: '내용을 입력하세요.',
					button: [
						{ name: '확인' } 
					],
					callback: () => {
						this.$refs.editContent.focus()
					}
				})
				return
			}
			
			const ucode = `L${this.levelSelected}_${this.partSelected}${this.daySelected}`

			let url
			if(this.viewerType === 'note') 		url = `${this.$config.LMSApiURL}/setStdNote-write`
			else if(this.viewerType === 'qna') 	url = `${this.$config.LMSApiURL}/setStdQna-write`
			const bcode = LM.returnBookCode(this.levelSelected, this.partSelected, this.daySelected)
			let query = {
				mem_id: this.userInfo.id,
				mode: 'new',
				level : this.levelSelected,
				part: this.partSelected,
				day: this.daySelected,
				Bcode: bcode.split('_')[0],
				Bno : bcode.split('_')[1].split('-')[0],
				Lno: bcode.split('_')[1].split('-')[1],
				subject: this.editTitle,
				comment: this.editContent
			}
			if(this.viewerData) {
				query.mode = 'modify'
				query.list_id = this.initData.list_id
			}

			await this.$http.post(url, query)
			this.$emit('update-list', 'add')

			this.$confirm({
				message: '작성한 글이 저장되었습니다.',
				button: [
					{ name: '확인' } 
				],
				callback: () => {
					if(this.viewerData) {
						this.viewerData.level = this.levelSelected,
						this.viewerData.part = this.partSelected,
						this.viewerData.day = this.daySelected,
						this.viewerData.Bcode = bcode.split('_')[0],
						this.viewerData.Bno = bcode.split('_')[1].split('-')[0],
						this.viewerData.Lno = bcode.split('_')[1].split('-')[1]
						this.viewerData.subject = this.editTitle
						this.viewerData.comment = this.editContent

						this.editMode = false
					} else {
						this.show = false
					}
				}
			})
		},

		onCancel () {
			if(this.viewerData) {
				this.editMode = false
			} else {
				this.show = false
			}
		},

		setDayNum () {
			const days = LM.returnBookDays(this.levelSelected, this.partSelected)
			this.dayOpt = []
			this.daySelected = 1
			for( let i=0; i<days.length; i++) {
				this.dayOpt.push({name: `Day ${days[i]}`, value: days[i]})
			}
		},

		setBookTitle () {
			const days = LM.returnBookDays(this.levelSelected, this.partSelected)
			this.titleOpt = []
			this.titleSelected = 1
			for( let i=0; i<days.length; i++) {
				const name = LM.returnBookCode(this.levelSelected, this.partSelected, days[i])
				if(name.indexOf('Review') > -1) {
					name = 'PS Review';
				}
				this.titleOpt.push({name: name.replace('_', ' '), value: days[i]})
			}
		},

		setDefaultCheck ( ucode ) {
			this.isDefault = true
			const level = this.$ucodeToLevel(ucode)
			const part = this.$ucodeToPart(ucode)
			const day = this.$ucodeToDay(ucode)

			this.levelSelected = level
			this.partSelected = part

			this.setDayNum()
			this.setBookTitle()

			this.daySelected = day
			this.titleSelected = day
			this.defaultPartChk = true

			if(this.titleToPartChk) {
				this.setTitleToPart()
			}

			setTimeout(() => {
				this.isDefault = false
			}, 100)
		},
		
		setTitleToPart () {
			this.isTitleToPart = true
			this.editTitle = this.listPart( this.levelSelected, this.partSelected, this.daySelected)
			setTimeout(() => {
				this.isTitleToPart = false
			}, 100)
		},

		onChangeDay () {
			this.titleSelected = this.daySelected
			if(!this.isDefault) {
				this.defaultPartChk = false
			}
			if(this.titleToPartChk) {
				this.setTitleToPart()
			}
		},

		onChangeTitle () {
			this.daySelected = this.titleSelected
			if(!this.isDefault) {
				this.defaultPartChk = false
			}
			if(this.titleToPartChk) {
				this.setTitleToPart()
			}
		},

		onClickDownload (name, path) {
			this.$confirm({
				message: '다운로드하시겠습니까?',
				button: [
					{ name: '취소', value: false },
					{ name: '확인', value: true } 
				],
				callback: async (confirm) => {
					if(confirm){
						var x=new XMLHttpRequest()
						x.open( "GET", `${this.$config.LMS_URL}${path}` , true)
						x.responseType="blob"
						x.onload= function(e){
							download(e.target.response, name);
						}
						x.send()
					}
				}
			})
		},
		
		onClose () {
			this.show = false
			this.$emit('close')
		},

		updateScroll ( scrollY ) {
			const scrollPosition = (this.$refs.contentText.offsetHeight - this.$refs.scrollBar.$el.offsetHeight) * scrollY
			this.$refs.scrollBar.scrollbar.scrollTop = scrollPosition + 6
		}
	}
}
</script>

<style lang="scss">
#text-viewer {
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
		background-color: #fff;
		border-radius: 40px;
		box-sizing: border-box;
		&.disable {
			pointer-events: none;
		}
	}

	.top-title {
		height: 97px;
		box-sizing: border-box;
		background-color: #00bfe6;
		border-bottom: solid 4px #0099b8;
		border-top-left-radius: 40px;
		border-top-right-radius: 40px;
		padding: 25px 40px;
		> h2 {
			font-size: 40px;
			font-weight: 600;
			color: #fff;
		}
	}

	.view-con {
		height: 760px;
		.scrollbar-track-y{
			transform: scaleY(0.98);
			right: 10px;
		}
		.title-con{
			padding: 35px;
			border-bottom: solid 3px #eee;
			
			.part {
				display: inline-block;
				padding: 5px 30px;
				background-color: #aaa;
				border-radius: 30px;
				text-align: center;
				font-size: 32px;
				font-weight: 600;
				color: #fff;
				> span {
					margin-left: 15px;
					font-size: 28px;
					vertical-align: middle;
				}
			}
			.title {
				font-size: 56px;
				font-weight: 600;
				color: #333;
				margin-top: 25px;
			}
		}

		.content-note {
			padding: 35px;
			box-sizing: border-box;
			font-size: 36px;
			.content-text {
				font-size: 36px;
				line-height: 60px;
			}
		}
		.content-qna {
			box-sizing: border-box;
			.content-question,
			.content-answer {
				position: relative;
				padding-left: 125px;
				min-height: 165px;
				box-sizing: border-box;
				> div{
					font-size: 36px;
					line-height: 60px;
					padding: 35px;
				}
			}
			.content-question {
				padding-bottom: 30px;
				border-bottom: solid 3px #eee;
				background: url('~@/assets/images/myself/q_icon.png') no-repeat 35px 35px;
			}
			.content-answer {
				padding-top: 20px;
				background: url('~@/assets/images/myself/a_icon.png') no-repeat 35px 35px;
				&.no-answer {
					opacity: 0.5;
				}
				h1 {
					font-size: 40px;
				}
				h2 {
					font-size: 32px;
				}
				h3 {
					font-size: 28px;
				}
				h4 {
					font-size: 24px;
				}
				h5 {
					font-size: 20px;
				}
				h6 {
					font-size: 16px;
				}
				blockquote {
					font-size: 20px;
					background: #ffffff;
					border-left: 11.2px solid #007bff;
					margin: 30px 11.2px;
					padding: 10px 11.2px;
				}
				ul li {
					list-style: unset;
				}
				ol li {
					list-style: unset;
				}
				img {
					max-width: 100%;
				}
			}
		}

		.content-download {
			margin-top: 50px;
			padding: 35px;
			box-sizing: border-box;

			.content-text {
				font-size: 36px;
				line-height: 60px;
				padding-bottom: 20px;
			}
			.content-files {
				padding: 10px 40px;
				border-radius: 10px;
				border: solid 2px #eee;
				li {
					margin: 30px 0;
				}
				.btn {
					font-size: 32px;
					font-weight: 500;
					color: #00aacc;
					vertical-align: middle;
					&:before {
						content: '';
						display: inline-block;
						width: 38px;
						height: 40px;
						background: url('~@/assets/images/myself/file_icon.png') no-repeat;	
						margin-right: 15px;
						vertical-align: middle;
					}
					&:hover {
						text-decoration: underline;
					}
				}
			}
		}
	}

	.edit-con {
		height: 760px;
		padding: 40px;
		box-sizing: border-box;
		.title-con{

			.part {
				.tit {
					display: inline-block;
					width: 148px;
					height: 70px;
					background: url('~@/assets/images/myself/part_bg.png') no-repeat;
					vertical-align: middle;
					font-size: 28px;
					font-weight: 600;
					color: #fff;
					padding: 18px 0 0 12px;
					margin-right: 5px;
				}
				.select-con {
					position: relative;
					margin: 0 5px;
					display: inline-block;
					vertical-align: middle;
					&.disable {
						pointer-events: none;
					}
					&:after {
						position: absolute;
						right: 25px;
						top: 32px;
						content: '';
						display: inline-block;
						width: 25px;
						height: 12px;
						background: url('~@/assets/images/common/select_arrow.png') no-repeat;
						pointer-events: none;
					}
					select {
						width: 250px;
						height: 73px;
						border: solid 4px #ddd;
						box-sizing: border-box;
						font-size: 28px;
						font-weight: 500;
						padding: 0 25px;
						outline: none;
						border-radius: 10px;
						box-shadow: 4px 4px 1px rgba(0,0,0,0.05);
					}
				}
				label {
					margin-left: 20px;
				}
			}

			.title {
				position: relative;
				margin-top: 35px;
				height: 95px;
				border-top-left-radius: 16px;
				border-top-right-radius: 16px;
				border:solid 4px #ddd;
				input[type="text"]{
					width: 1080px;
					height: 100%;
    				padding: 35px;
					font-size: 36px;
					border:none;
					outline: none;
					background: transparent;
				}
				
			}

			.right-check {
				position: absolute;
				height: 100%;
				top: 0;
				right: 0;
				background-color: #f6f6f6;
				width: 330px;
				border-left: solid 4px #ddd;
				box-sizing: border-box;
				padding: 22px 0 0 20px;
			}

			label {
				position: relative;
				display: inline-block;
				font-size: 32px;
				vertical-align: middle;
				> input {
					width: 40px;
					height: 40px;
					opacity: 0;
					vertical-align: middle;
				}
				> span {
					position: absolute;
					left: 0;
					top:0;
					display: inline-block;
					width: 40px;
					height: 40px;
					background: url("~@/assets/images/myself/check_box2.png") no-repeat;
					vertical-align: middle;
				}
				> input:checked + span {
					background-position-y: -40px;
				}
			}


		}

		.content {
			height: 467px;
			box-sizing: border-box;
			border-bottom-left-radius: 16px;
			border-bottom-right-radius: 16px;
			border:solid 4px #ddd;
			border-top: none;
			textarea {
				width: 100%;
				height: 100%;
				box-sizing: border-box;
				padding: 35px;
				border:none;
				outline: none;
				font-size: 36px;
				line-height: 60px;
				resize: none;
				background: transparent;
			}
		}
	}

	.bottom-con {
		position: relative;
		border-radius: 0 0 35px 35px;
		height: 128px;
		border-top: solid 4px #e5e5e5;
		background-color: #f6f6f6;
		box-sizing: border-box;
		padding: 25px 30px;
		.right {
			float: right;
		}
		.center {
			text-align: center;
		}
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
			&.modify-btn,
			&.cancel-btn {
				background-color: #fff;
				color: #006a80;
				border: solid 4px #006a80;
				box-shadow: 3px 3px 1px rgba(0,0,0,0.05);
			}
			&.close-btm-btn {
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
</style>