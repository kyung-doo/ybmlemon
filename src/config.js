
export const JanusConfig = {
	// server: 'wss://janus.conf.meetecho.com/ws',
	// server: 'ws://192.168.21.179:8188/janus',
	// server: 'wss://192.168.21.226:8189/janus',
	// server: 'ws://192.168.21.226:8188/janus',
	// server: 'wss://192.168.21.226:8189/janus',
	// server: 'https://data.srmm.kr:8089/janus',
	// server: 'https://192.168.21.226:8089/janus',
	// server: 'https://rtc2.ybmlemon.com:7890/janus',
	server: 'wss://rtc1.ybmlemon.com:8890/janus',
	
	debug: false,
	roomOption: {
		publishers: 4,
		bitrate: 600 * 1000,
		bitrate_cap: true,
		admin_key: '1qaz!qaz'
	}
}

export const RecorderConfig = {
	// server: 'https://127.0.0.1:8002',
	// server: 'https://192.168.21.179:8002',
	server: 'https://rec.ybmlemon.com:8001',
	

	bps: {
		server: 3,
		local: 5,
	},

	bitrate: {
		server: 200000,
		local:  300000
	}
}

export default {
	
	// 메인수업 iframe url
	mainStudyFrameURL: '/LM_module/test_mc.html',

	// 서브 수업 iframe url (pre, after, homework-on)
	subStudyFrameURL: '/LM_module/test_sc.html',

	// LMS url
	// LMS_URL: '',
	LMS_URL: 'https://ybmlemon.com',

	// LMSApiURL: '/api/LM_lms',
	LMSApiURL: 'https://ybmlemon.com/api/LM_lms',

	// CMS API url
	// CMSApiURL: '/LM_cms/api',
	CMSApiURL: 'https://rcms.ybmlemon.com/LM_cms/api',

	// CMS DATA url
	// CMSDataURL: '/LM_cms/data',
	CMS_URL: 'https://rcms.ybmlemon.com',

	// 시간 디버깅 유무
	debugTime: false,

	// 학습정보 가져올 타입 session | api
	studyInfoType: 'api'
}