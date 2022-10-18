import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import studyStore from './study'
import myselfStore from './myself'



Vue.use(Vuex)

export default new Vuex.Store({

	modules: {
		study: studyStore,
		myself: myselfStore
	},

	state: {

		// 참여 멤버
		memberInfo: [],

		// 회원 정보
		userInfo: {
			// 회원 id
			id: '',
			// 회원 type KT|FT|ST|OB
			type: '',
			// 회원 이름
			name: '',
			// 유니크 구별값
			pcd_seq:''
		},

		// 회원 포인트
		pointInfo: {
			// 총 포인트
			totalPoints: null,
			// 전달 총 포인트
			prevMonthPoints: null,
			// 이번달 총 포인트
			nowMonthPoints: null,
			// 현재 수업 총 포인트
			classPoints: null,
			// pre-class 포인트
			prePoint: null,
			// main-class 포인트
			mainPoint: null,
			mainPointK: null,
			mainPointF: null,
			// after-class 포인트
			afterPoint: null,
			// homwork-on 포인트
			homeworkOnPoint: null,
			// homwork-off 포인트
			homeworkOffPoint: null,
			
			prevMonthRank: null,
			
		},

		// 학습 정보
		studyInfo: {
			// ucode
			ucode: '',
			// pre-class 진행 유무
			prePassed: false,
			// main-class 진행 유무
			mainPassed: false,
			// after-class 대기 유무
			afterWait: false,
			// 교재 정보
			bookMeta: null,
			bookMetaF: null,
			// pre 시작 시간
			preStartTime: null,
			// class 시작 시간
			classStartTime: null,
			// class 종료 시간
			classEndTime: null,
			// A-test 유무
			isAtest: false,
			// ot day 유무
			otday: false
		},

		// 현재 학습 상태
		studyStatus: 'off',

		// 학습 모드
		studyMode: 'study',

		// 학습 알람 유무
		alarm: JSON.parse(window.localStorage.getItem('alarm'))
	},

	mutations: {
		['SET_USER_INFO'] (state, userInfo) {
			Object.assign(state.userInfo, userInfo)
		},

		['SET_MEMBER_INFO'] (state, memberInfo) {
			state.memberInfo = memberInfo
		},

		['SET_POINT_INFO'] (state, pointInfo) {
			Object.assign(state.pointInfo, pointInfo)
		},

		['ADD_POINT'] (state, point) {
			state.pointInfo.totalPoint += point.value
			state.pointInfo.nowMonthPoint += point.value
			state.pointInfo.currntPoints += point.value
			state.pointInfo[point.type] += point.value
		},

		['SET_STUDY_INFO'] (state, studyInfo) {
			Object.assign(state.studyInfo, studyInfo)
		},

		['SET_STUDY_STATUS'] (state, status) {
			state.studyStatus = status
		},

		['SET_ALARM'] (state, value) {
			window.localStorage.setItem('alarm', value)
			state.alarm = value
		},

		['SET_STUDY_MODE'] (state, value) {
			state.studyMode = value
		}
	},

	getters: {
		getUserInfo ( state ) {
			return state.userInfo
		},

		getMemberInfo ( state ) {
			return state.memberInfo
		},

		getPointInfo ( state ) {
			return state.pointInfo
		},

		getStudyInfo ( state ) {
			return state.studyInfo
		},

		getStudyStatus ( state ) {
			return state.studyStatus
		},

		getStudyMode ( state ) {
			return state.studyMode
		},

		getAlarm ( state ) {
			return state.alarm
		}
	},

	actions: {
		setUserInfo ( { commit }, userInfo) {
			commit('SET_USER_INFO', userInfo)
		},

		setMemberInfo ( { commit }, memberInfo) {
			commit('SET_MEMBER_INFO', memberInfo)
		},

		setPointInfo ( { commit }, points) {
			commit('SET_POINT_INFO', points)
		},

		addPoint( { commit }, point ) {
			commit('ADD_POINT', point)
		},

		setStudyInfo ( { commit }, studyInfo) {
			commit('SET_STUDY_INFO', studyInfo)
		},

		setStudyStatus ( { commit }, status) {
			commit('SET_STUDY_STATUS', status)
		},

		setStudyMode ( { commit }, mode) {
			commit('SET_STUDY_MODE', mode)
		},

		setAlarm ( { commit }, value) {
			commit('SET_ALARM', value)
		}
	}
})
