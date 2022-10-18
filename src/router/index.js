import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)


export default new Router({
	// mode:'history',
	routes: [
		// Error 페이지
		{
			path: "*",
			name: 'Error',
			component: {
				render: h => {
					return h('div', [])
				},
				created: function () {
					alert('잘못된 접근 입니다.')
					if (window.parent) self.close()
				}
			}
		},


		// 홈
		{
			path: '/',
			name: 'Home',
			component: () => import('../pages/Home')
		},



		// 스터디
		{
			path: '/study',
			name: 'Study',
			component: () => import('../pages/study/Study'),
			children: [
				// Pre 스터디
				{
					path: 'prestudy',
					name: 'PreStudy',
					component: () => import('../pages/study/SubStudy'),
				},
				// Main 스터디
				{
					path: 'mainstudy',
					name: 'MainStudy',
					component: () => import('../pages/study/MainStudy'),
				},
				// After 스터디
				{
					path: 'afterstudy',
					name: 'AfterStudy',
					component: () => import('../pages/study/SubStudy'),
				}
			]
		},


		// 홈워크 on
		{
			path: '/homework-on',
			name: 'HomeworkOn',
			component: () => import('../pages/study/SubStudy')
		},


		// 자기주도 학습표
		{
			path: '/myself/study-table',
			name: 'MyselfStudyTable',
			component: () => import('../pages/myself/StudyTable')
		},


		// 홈워크 off ( 사진 )
		{
			path: '/myself/homework-picture',
			name: 'MyselfHomeworkPicture',
			component: () => import('../pages/myself/HomeworkPicture')
		},
		// 홈워크 off ( 사진 ) 상세보기
		{
			path: '/myself/homework-picture/view',
			name: 'MyselfHomworkPictureView',
			component: () => import('../pages/myself/HomeworkPictureView'),
			props: true
		},


		// 학습노트
		{
			path: '/myself/homework-note',
			name: 'MyselfHomeworkNote',
			component: () => import('../pages/myself/HomeworkNote'),
		},

		// 자료방
		{
			path: '/myself/download',
			name: 'MyselfDownload',
			component: () => import('../pages/myself/DataDownLoad'),
		},

		// Q&A
		{
			path: '/myself/qna',
			name: 'MyselfQNA',
			component: () => import('../pages/myself/Qna'),
		},



		// 마이갤러리
		{
			path: '/myself/mygallery',
			name: 'MyGallery',
			component: () => import('../pages/myself/MyGallery'),
		},
	]
})

