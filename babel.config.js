module.exports = {
	presets: [
		[
			"@babel/preset-env", {
				targets: {
					browsers: ["> 1%", "last 2 versions", "ie >= 11"]
				}
			},
			"stage-2"
		]
	],
	plugins: [
		'@babel/plugin-proposal-class-properties'
	]
}
