import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Fragment from 'vue-fragment'
import axios from 'axios'
import VueConfirmDialog from '@/plugins/vue-confirm-dialog'
import VueRangeSlider from '@/plugins/vue-range-slider'
import SmoothScrollbar from 'vue-smooth-scrollbar'

import dateFormat from 'dateformat'
dateFormat.i18n.timeNames = ["a", "p", "am", "pm", "A", "P", "오전", "오후"]
dateFormat.i18n.dayNames = ['일', '월', '화', '수', '목', '금', '토', '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

import { 
  Button,
  TabMenu,
  Sequence
} from './components/ui'
import ExitButton from './components/ExitButton'
import HomeButton from './components/HomeButton'
import config  from '@/config'
import ListFlip from '@/directives/listFlip'
import  * as Device from 'mobile-device-detect';


// if( location.href.split('?').length > 1 ) {
//   const params = location.href.split('?')[1]
//   window.sessionStorage.setItem('viewerInfo', decodeURIComponent ( params ))
// }




Vue.config.productionTip = false
Vue.use(Fragment.Plugin)
Vue.use(VueConfirmDialog)
Vue.use(VueRangeSlider)
Vue.use(SmoothScrollbar)


// 전역 컴포넌트 등록
Vue.component('ui-button', Button)
Vue.component('ui-tab-menu', TabMenu)
Vue.component('ui-sequence', Sequence)
Vue.component('exit-button', ExitButton)
Vue.component('home-button', HomeButton)
Vue.component('tag', {
	name: 'tag',
	render( h ) {
		return h(this.tagName, this.$slots.default)
	},
	props: {
		tagName: {
			type: String,
			default: 'div'
		}
	}
})



// 전역 프로퍼티 등록
const EventBus = new Vue(); 

Object.defineProperties(Vue.prototype, { 
	$eventBus: { 
		get: () => {
			return EventBus;
		}
	},
	$http: {
		get: () => {
			return axios;
		} 
	},
	$dateformat: {
		get: () => {
			return dateFormat
		}
	},
	$config: {
		get: () => {
			return config
		}
	},
	$baseUrl: {
		get: () => {
			return '/LM_viewer/'
		}
	}
})



// 파일 용량
Vue.prototype.$fileSize = ( size ) => {
	if (size > 1024 * 1024 * 1024 * 1024) {
		return (size / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB'
	} else if (size > 1024 * 1024 * 1024) {
		return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
	} else if (size > 1024 * 1024) {
		return (size / 1024 / 1024).toFixed(2) + ' MB'
	} else if (size > 1024) {
		return (size / 1024).toFixed(2) + ' KB'
	}
	return size.toString() + ' B'
}

// 랜덤 문자열
Vue.prototype.$randomString = function ( len ) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}
	return randomString;
}
// 0 붙히기
Vue.prototype.$addZero = function(number, length) {
	let my_string = '' + number;
	while (my_string.length < length) {
		my_string = '0' + my_string;
	}
	return my_string;
}


// ucode 레벨 추출
Vue.prototype.$ucodeToLevel = function ( ucode ) {
	return ucode.split('_')[0].slice(1)
}

// ucode 파트 추출
Vue.prototype.$ucodeToPart = function ( ucode ) {
	return ucode.split('_')[1].slice(0, 1)
}

// ucode 파트 풀네임
Vue.prototype.$ucodeToPartFullname = function ( ucode ) {
	return this.$ucodeToPart( ucode ) === 'R' ? 'Reading' : 'Speaking'
}

// ucode 데이 추출
Vue.prototype.$ucodeToDay = function ( ucode ) {
	return ucode.split('_')[1].slice(1)
}

// fullscreen
Vue.prototype.$fullscreen = function () {
	var doc = window.document
	var docEl = doc.documentElement
	var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen
	requestFullScreen.call(docEl)
}

// console.log(LM.returnBookCode(2, "R", 11), LM.returnDayNums(2))


// 전역 믹스인 등록
Vue.mixin({
	// created: function () {
	// 	if(!window.sessionStorage.getItem('viewerInfo')) {
	// 		if(this.$router.currentRoute.name !== 'Error')
	// 		this.$router.push({name: 'Error'})
	// 	}
	// },
	computed: {
		// 수업 상태 학생 : off, onBeforePre, onPre, onMain, onAfter
		// 교사 : off, onBeforeMain, onMain
		studyStatus() {
			return this.$store.getters['getStudyStatus']
		},

		// 학습 모드 ( study | free )
		studyMode () {
			return this.$store.getters['getStudyMode']
		},

		// 회원 정보
		userInfo() {
			return this.$store.getters['getUserInfo']
		},

		// 멤버 정보
		memberInfo() {
			return this.$store.getters['getMemberInfo']
		},

		// 포인트 정보
		pointInfo () {
			return this.$store.getters['getPointInfo']
		},

		// 학습 정보
		studyInfo() {
			return this.$store.getters['getStudyInfo']
		}
  	}
})

// 전역 디렉티브
Vue.directive('listFlip', ListFlip)


// window 이벤트 등록
window.onload = ( e ) => {
	EventBus.$emit('window:load', e)
}

window.onbeforeunload = () => {
	EventBus.$emit('window:beforeUnload')
	if(window.opener) window.opener.postMessage({msg: 'close', id: window.name }, "*")
}

window.unload = () => {
	EventBus.$emit('window:unload')
}

window.onresize = ( e ) => {
	EventBus.$emit('window:resize', e)
}

window.onmousedown = window.touchstart = ( e ) => {
	EventBus.$emit('window:touchstart', e)
}

window.onmousemove = window.touchmove = ( e ) => {
	EventBus.$emit('window:touchmove', e)
}

window.onmouseup = window.touchend = ( e ) => {
	EventBus.$emit('window:touchend', e)
}

window.onrecivestudydata = ( data ) => {
	EventBus.$emit('studyframe:reciveData', data)
}

window.onrecivestudymessage = ( message ) => {
	console.log('STUDY_MESSAGE :: ', message )
	EventBus.$emit('studyframe:reciveMessage', message)
}

try {
	if(!Device.isMobile) {
		navigator.mediaDevices.ondevicechange = (event) => {
			EventBus.$emit('deviceChange', event)
		}
	}
} catch( e ) {}

var vueInstance = null

window.addEventListener("message", ( e ) => {
	if(e.data.msg && e.data.msg === "viewerInfo") {
		window.sessionStorage.setItem('viewerInfo', e.data.data);
		setTimeout(()=> {
			if(!vueInstance) {
				vueInstance = new Vue({
					router,
					store,
					render: h => h(App),
				}).$mount('#app')
			}
		})
	}
}, false);

if(window.sessionStorage.getItem('viewerInfo')) {
	if(!vueInstance) {
		vueInstance = new Vue({
			router,
			store,
			render: h => h(App),
		}).$mount('#app')
	}
} else {
	if(window.opener) window.opener.postMessage({msg: 'getViewerInfo', id: window.name }, "*");
}
