import _ from 'lodash'

const preStudy = {

	namespaced: true,

	state: {
		
	},

	mutations: {

	},

	getters: {

	},

	actions: {
		
	}
}



const mainStudy = {

	namespaced: true,

	state: {


		firstTeacher: 'K',

		// 룸번호
		roomCode: '',

		// 현재 권한
		owner: 'KT',

		// 마이크 음소거
		micMuted: JSON.parse(window.localStorage.getItem('micMuted')) ? true : false,

		// 화상 볼륨
		volume: JSON.parse(window.localStorage.getItem('volume')) ? JSON.parse(window.localStorage.getItem('volume')) : 100,

		// 한국 교사 stream
		KTStream: null,
		
		// 필리핀 교사 stream
		FTStream: null,

		// 학생 stream
		STStream: null,

		// 화면공유 stream
		SSStream: null,

		// 자신을 제외한 룸안에 있는 게시자 리스트
		roomLists: [],

		// 대화창 데이터 리스트
		messages: [],

		// 수업 엑티비티 번호
		studyPages: ['K0', 0],

		// 화이트 보드 데이터
		whiteBoard: {
			status: 'close',
			historyUndo: [],
			historyRedo:[],
			data: {},
			fillColor: '#000000',
			lineColor: '#000000',
			lineWidth: 2,
			opacity: 1,
			whiteMode: false
		},

		// 줌 모드
		zoomMode: {
			enabled: false,
			hideLeftBar: false,
			previewStudy: true
		},

		// 뷰어 설정
		configs: {
			// low: 320x240 medium : 640x480 high: 1280x720
			qulity: 'medium',
			videoInput: '',
			audioInput: '',
			audioOutput: ''
		},

		// 클래스 멤버
		classMembers: [],

		// 학생 권한
		STPermissions: {
			buzzer: false,
			dice: false,
			board: false,
			activity: false,
			chatting: false
		}
	},

	mutations: {
		['SET_FIRST_TEACHER'] ( state, teacher ) {
			state.firstTeacher = teacher
		},

		['SET_ROOM_CODE'] ( state, num ) {
			state.roomCode = num
		},

		['SET_OWNER'] ( state, type ) {
			state.owner = type
		},

		['SET_STREAM'] ( state, { type, stream } ) {
			state[`${type}Stream`] = stream
		},

		['REMOVE_STREAM'] ( state, type ) {
			if(state[`${type}Stream`]) {
				state[`${type}Stream`].getTracks().forEach(( track ) => {
					track.onended = null
					track.stop();
				})
			}
			state[`${type}Stream`] = null
		},

		['REMOVE_ALL_STREAM'] ( state ) {
			if(state.KTStream) {
					state.KTStream.getTracks().forEach(( track ) => {
						track.onended = null
						track.stop();
					})
			}
			if(state.FTStream) {
					state.FTStream.getTracks().forEach(( track ) => {
						track.onended = null
						track.stop();
					})
			}
			if(state.STStream) {
					state.STStream.getTracks().forEach(( track ) => {
						track.onended = null
						track.stop();
					})
			}
			if(state.SSStream) {
					state.SSStream.getTracks().forEach(( track ) => {
						track.onended = null
						track.stop();
					})
			}
			state.KTStream = null
			state.FTStream = null
			state.STStream = null
			state.SSStream = null
		},

		['SET_ROOM_LISTS'] ( state, lists ) {
			state.roomLists = lists
		},

		['SET_MESSAGES'] ( state, messages ) {
			state.messages = messages
		},
		
		['SET_MESSAGE'] ( state, message ) {
			state.messages.push( message )
		},
		
		['SET_WHITE_BOARD'] ( state, data ) {
			Object.assign( state.whiteBoard, data )
		},

		['SET_ZOOM_MODE'] ( state, value ) {
			Object.assign(state.zoomMode, value)
		},
		
		['SET_CONFIGS'] ( state, config ) {
			Object.assign( state.configs, config )
		},
		
		['SET_CLASS_MEMBERS'] ( state, members ) {
			state.classMembers = members
		},

		['SET_MIC_MUTED'] ( state, value ) {
			window.localStorage.setItem('micMuted', value)
			state.micMuted = value
		},

		['SET_VOLUME'] ( state, value ) {
			window.localStorage.setItem('volume', value)
			state.volume = value
		},

		['SET_STUDY_PAGES'] ( state, value ) {
			state.studyPages = value
		},

		['SET_ST_PERMISSIONS'] ( state, value ) {
			Object.assign( state.STPermissions, value )
		},

		['RESET'] ( state ) {
			Object.assign(state, _.cloneDeep(initMainStudyState))
		}
		
	},

	getters: {
		getFirstTeacher ( state ) {
			return state.firstTeacher
		},

		getRoomCode ( state ) {
			return state.roomCode
		},

		getOwner ( state ) {
			return state.owner
		},

		getStream ( state ) {
			return ( type ) => {
					return state[`${type}Stream`]
			}
		},

		getRoomLists ( state ) {
			return state.roomLists
		},

		getMessages ( state ) {
			return state.messages
		},

		getWhiteBoard ( state ) {
			return state.whiteBoard
		},

		getZoomMode ( state ) {
			return state.zoomMode
		},

		getConfigs ( state ) {
			return state.configs
		},

		getClassMembers ( state ) {
			return state.classMembers
		},

		getMicMuted ( state ) {
			return state.micMuted
		},

		getVolume ( state ) {
			return state.volume
		},

		getStudyPages ( state ) {
			return state.studyPages
		},

		getSTPermissions ( state ) {
			return state.STPermissions
		}
	},

	actions: {
		setFirstTeacher({ commit }, value) {
			commit('SET_FIRST_TEACHER', value)
		},

		setRoomCode({ commit }, value) {
			commit('SET_ROOM_CODE', value)
		},

		setOwner({ commit }, value) {
			commit('SET_OWNER', value)
		},

		setStream ({ commit }, value ) {
			commit('SET_STREAM', value)
		},

		removeStream ({ commit }, value) {
			commit('REMOVE_STREAM', value)
		},
		
		removeAllStream({ commit }) {
			commit('REMOVE_ALL_STREAM')
		},

		setRoomList ({ commit }, value) {
			commit('SET_ROOM_LISTS', value)
		},

		setMessages({ commit }, value) {
			commit('SET_MESSAGES', value)
		},

		setMessage({ commit }, value) {
			commit('SET_MESSAGE', value)
		},

		setWhiteBoard({ commit }, value) {
			commit('SET_WHITE_BOARD', value)
		},

		setZoomMode({ commit }, value) {
			commit('SET_ZOOM_MODE', value)
		},

		setConfigs({ commit }, value) {
			commit('SET_CONFIGS', value)
		},

		setClassMembers({ commit }, value) {
			commit('SET_CLASS_MEMBERS', value)
		},

		setMicMuted({ commit }, value) {
			commit('SET_MIC_MUTED', value)
		},

		setVolume({ commit }, value) {
			commit('SET_VOLUME', value)
		},

		setStudyPages({ commit }, value) {
			commit('SET_STUDY_PAGES', value)
		},

		setSTPermissions ({ commit }, value) {
			commit('SET_ST_PERMISSIONS', value)
		},

		reset({ commit }) {
			commit('RESET')
		}
	}
}




const afterStudy = {

	namespaced: true,

	state: {
		
	},

	mutations: {

	},

	getters: {

	},

	actions: {
		
	}
}

const initPreStudyState = _.cloneDeep( preStudy.state )
const initMainStudyState = _.cloneDeep( mainStudy.state )
const initAfterStudyState = _.cloneDeep( afterStudy.state )

export default {
	namespaced: true,
	
	modules: {
		mainStudy: mainStudy,
		preStudy: preStudy,
		afterStudy: afterStudy
	}
}