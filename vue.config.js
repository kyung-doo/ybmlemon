
const
	express = require('express'),
	path = require('path'),
	fs = require('fs'),
	ansiRegex = require('ansi-regex'),
	bodyParser = require('body-parser'),
	formidable = require('express-formidable'),
	pageTitle = 'YBM 레몬 학습뷰어'

let
	transpileDependencies = [],
	entry = [
		'babel-polyfill',
		'./src/main.js'
	]


if (process.env.NODE_ENV === 'production') {
	transpileDependencies = [ansiRegex]
	entry = [
		'babel-polyfill',
		'whatwg-fetch',
		'./src/main.js'
	]
}
function randomString(len) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}
	return randomString;
}

module.exports = {

	transpileDependencies: transpileDependencies,

	lintOnSave: false,
	publicPath: '/LM_viewer/',

	chainWebpack(config) {
		config.resolve.alias.set('@', path.join(__dirname, './src'))
		// config.optimization.minimize(false)
		config
			.plugin('html')
			.tap(args => {
				args[0].title = pageTitle
				return args
			})
	},

	css: {
		loaderOptions: {
			sass: {
				data: '@import "@/assets/css/common.scss";'
			}
		}
	},

	configureWebpack: {
		entry: entry,
	},

	outputDir: path.resolve(__dirname, "../../lemon/LM_viewer"),

	devServer: {
		compress: true,
    	disableHostCheck: true,
		port: 8081,
		before: app => {
			app.use(bodyParser.urlencoded())
			app.use(bodyParser.json())
			app.use(express.static(path.join(__dirname, 'test')))


			app.get('/', (req, res) => {
				res.sendFile(path.join(__dirname, 'test', 'test.html'))
			})

			app.post('/api/LM_lms/:id', (req, res) => {
				console.log(req.params)
				const pid = req.params.id.split('.')[0]
				if (pid === 'setHmwkOff-picture') {
					const contentType = req.headers['content-type']
					console.log(req.headers)
					let buffer = ''
					req.on('data', (chunk) => {
						buffer += chunk.toString()
					})
					req.on('end', () => {
						//console.log( 'buffer : ' , buffer )
						res.json({ 
							// ok: 1, 
							ok: Math.floor(Math.random()*2),
							pic_id: randomString(10), 
							path: '/uploads/img1.jpg'
						})
						// res.status(500).end()
					})
				} else if( 
					pid === 'deleteHmwkOff-picture' || 
					pid === 'deleteHmwkOff-note' || 
					pid === 'setHmwkOff-note' ||
					pid === 'deleteStudyQna' || 
					pid === 'setStudyQna' ||
					pid === 'setReportCheck') {
					res.json({ ok: 1 })
				} else if(pid === "getHmwkReport") {
					const data = fs.readFileSync(path.join(__dirname, 'test', 'api', `getHmwkReport${req.body.part}.json`))
					res.header("Content-Type", 'application/json')
					res.json(JSON.parse(data))
				} else {
					const data = fs.readFileSync(path.join(__dirname, 'test', 'api', `${pid}.json`))
					res.header("Content-Type", 'application/json')
					res.json(JSON.parse(data))
				}
			})

			app.get('/api/LM_cms/:id', (req, res) => {
				console.log(req.params)
				const pid = req.params.id.split('.')[0]
				if(pid === "getWSC") {
					const data = fs.readFileSync(path.join(__dirname, 'test', 'api', `getWSC_${req.query.part}.json`))
					res.header("Content-Type", 'application/json')
					res.json(JSON.parse(data))
				} else {
					const data = fs.readFileSync(path.join(__dirname, 'test', 'api', `${pid}.json`))
					res.header("Content-Type", 'application/json')
					res.json(JSON.parse(data))
				}
			})

			
		},
		https: true,
		https: {
			key: fs.readFileSync('C:\\OpenSSL\\bin\\private.key'),
			cert: fs.readFileSync('C:\\OpenSSL\\bin\\private.crt'),
			passphrase: '1q2w3e'
		},
		hot: false,
		liveReload: false,
		proxy: {
			'/LM_module': {
				// target: 'https://192.168.11.215:5500'
				target: 'https://220.73.172.52'
				// target: 'https://121.167.99.4:8081/'
			},
			'/LM_common': {
				// target: 'https://192.168.11.215:5500',
				// target: 'https://192.168.11.54'
				target: 'https://220.73.172.52'
				// target: 'https://121.167.99.4:8081/'
			},
			'/LM_cms' : {
				target: 'https://220.73.172.52'
			}
		}
	}
}