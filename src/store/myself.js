export default {
	namespaced: true,

	state: {

		posHomeWorkOn: '',
		latestUp: 0,

		homeworkOnUcode: '',

		homeworkOnPcd: '',

		homeworkOnRestudys: [],

		homeworkOffInfo: {
			R: [],
			S: []
		},
		homeworkSdlInfo: {
			R: '',
			S: ''
		},
		

		pictureData: {
			total: 0,
			page: 0,
			view_num: 10,
			Lists: []
		},

		noteData: {
			total: 0,
			page: 0,
			view_num: 10,
			Lists: []
		},

		qnaData: {
			total: 0,
			page: 0,
			view_num: 10,
			Lists: []
		},

		galleryData: [],
		
		downloadData: {
			total: 0,
			page: 0,
			view_num: 10,
			Lists: []
		}
	},

	mutations: {
		['SET_LATEST_UP'] (state, value) {
			state.latestUp = value
		},

		['SET_POS_HOMEWORK_ON'] (state, value) {
			if(value) {
				state.posHomeWorkOn = value
				const splits = value.split('_')
				state.homeworkOnUcode = splits[0]+'_'+splits[1]
			}
		},

		['SET_HOMEWORK_ON_PCD'] (state, value) {
			state.homeworkOnPcd = value
		},

		['SET_HOMEWORK_ON_RESTUDYS'] (state, value) {
			state.homeworkOnRestudys = value
		},

		['SET_HOMEWORK_OFF_INFO'] (state, value) {
			state.homeworkOffInfo = value
		},

		['SET_HOMEWORK_SDL_INFO'] (state, value) {
			state.homeworkSdlInfo= value
		},

		['SET_PICTURE_DATA'] (state, value) {
			Object.assign(state.pictureData, value)
		},

		['RESET_PICTURE_DATA'] ( state ) {
			state.pictureData = { total: 0, page: 0, view_num: 10, Lists: [] }
		},

		['SET_NOTE_DATA'] (state, value) {
			Object.assign(state.noteData, value)
		},

		['RESET_NOTE_DATA'] ( state ) {
			state.noteData = { total: 0, page: 0, view_num: 10, Lists: [] }
		},

		['SET_QNA_DATA'] (state, value) {
			Object.assign(state.qnaData, value)
		},

		['RESET_QNA_DATA'] ( state ) {
			state.qnaData = { total: 0, page: 0, view_num: 10, Lists: [] }
		},

		['SET_GALLERY_DATA'] (state, value) {
			state.galleryData = value
		},

		['RESET_GALLERY_DATA'] ( state ) {
			state.galleryData = []
		},

		['SET_DOWNLOAD_DATA'] (state, value) {
			Object.assign(state.downloadData, value)
		},

		['RESET_DOWNLOAD_DATA'] ( state ) {
			state.downloadData = { total: 0, page: 0, view_num: 10, Lists: [] }
		}
	},

	getters: {
		getLatestUp ( state ) {
			return state.latestUp
		},

		getPosHomeworkOn ( state ) {
			return state.posHomeWorkOn
		},

		getHomeworkOnPcd ( state ) {
			return state.homeworkOnPcd
		},

		getHomeworkOnUcode ( state ) {
			return state.homeworkOnUcode
		},

		getHomeworkOnRestudys ( state ) {
			return state.homeworkOnRestudys
		},

		getHomeworkOffInfo ( state ) {
			return state.homeworkOffInfo
		},

		getHomeworkSdlInfo ( state ) {
			return state.homeworkSdlInfo
		},

		getLatestHomeworkOff ( state ) {
			if(state.homeworkOffInfo.R.length === 0 && state.homeworkOffInfo.S.length === 0 ) {
				return null
			} else if(state.homeworkOffInfo.R.length > 0  && state.homeworkOffInfo.S.length === 0  ) {
				return state.homeworkOffInfo.R
			} if(state.homeworkOffInfo.R.length === 0  && state.homeworkOffInfo.S.length > 0  ) {
				return state.homeworkOffInfo.S
			} else {
				const dateR = new Date(state.homeworkOffInfo.R[2]).getTime()
				const dateS = new Date(state.homeworkOffInfo.S[2]).getTime()
				if(dateR > dateS) {
					return state.homeworkOffInfo.R
				} else {
					return state.homeworkOffInfo.S
				}
			}
		},

		getPictureData ( state ) {
			return state.pictureData
		},

		getNoteData ( state ) {
			return state.noteData
		},

		getQnaData ( state ) {
			return state.qnaData
		},

		getGalleryData ( state ) {
			return state.galleryData
		},

		getDownloadData ( state ) {
			return state.downloadData
		}
	},

	actions: {
		setLatestUp ( { commit }, value) {
			commit('SET_LATEST_UP', value)
		},

		setPosHomeworkOn ( { commit }, value) {
			commit('SET_POS_HOMEWORK_ON', value)
		},

		setHomeworkOnPcd ( { commit }, value) {
			commit('SET_HOMEWORK_ON_PCD', value)
		},

		setHomeworkOnRestudys ( { commit }, value) {
			commit('SET_HOMEWORK_ON_RESTUDYS', value)
		},

		setHomeworkOffInfo ( { commit }, value ) {
			commit('SET_HOMEWORK_OFF_INFO', value)
		},

		setHomeworkSdlInfo ( { commit }, value ) {
			commit('SET_HOMEWORK_SDL_INFO', value)
		},

		setPictureData ( { commit }, value) {
			commit('SET_PICTURE_DATA', value)
		},

		resetPictureData ({ commit }) {
			commit('RESET_PICTURE_DATA')
		},

		setNoteData ( { commit }, value) {
			commit('SET_NOTE_DATA', value)
		},

		resetNoteData ({ commit }) {
			commit('RESET_NOTE_DATA')
		},

		setQnaData ( { commit }, value) {
			commit('SET_QNA_DATA', value)
		},

		resetQnaData ({ commit }) {
			commit('RESET_QNA_DATA')
		},
		
		setGalleryData ( { commit }, value) {
			commit('SET_GALLERY_DATA', value)
		},

		resetGalleryData ({ commit }) {
			commit('RESET_GALLERY_DATA')
		},
		
		setDownloadData ( { commit }, value) {
			commit('SET_DOWNLOAD_DATA', value)
		},

		resetDownloadData ({ commit }) {
			commit('RESET_DOWNLOAD_DATA')
		}
	}
}