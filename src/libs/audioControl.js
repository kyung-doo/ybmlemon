class AudioControl {

	constructor(src, option) {
		this.audio = document.createElement('audio')
		const source = document.createElement('source')
		source.type = 'audio/mpeg'
		source.src = require(`@/assets/audio/${src}`)
		this.audio.appendChild(source)
		document.body.appendChild(this.audio)
		this.options = Object.assign({
			autoplay: false,
			loop: false,
			volume: 1,
			onUpdate: null,
			onFinish: null
		}, option)
		this.audio.volume = this.options.volume
		this.timer = null

		if (this.options.autoplay) {
			setTimeout(() => {
				this.play()
			})
		}
	}

	play(seek = null) {
		if (this.audio.paused) {
			if (seek) this.audio.currentTime = seek
			this.audio.play().then(e => { }).catch(err => { })
			this.timer = setInterval(this.onUpdate.bind(this), 1000 / 30)
			this.onUpdate()
		}
		return this
	}

	set volume(vol) {
		this.audio.volume = vol
	}

	get volume() {
		this.audio.volume
	}

	pause() {
		if (!this.audio.paused) {
			this.audio.pause()
			clearInterval(this.timer)
		}
		return this
	}

	stop() {
		if (!this.audio.paused) {
			this.audio.pause()
			this.audio.currentTime = 0
			clearInterval(this.timer)
		}
		return this
	}

	onUpdate() {
		if(this.audio) {
			if (this.audio.currentTime >= this.audio.duration) {
				this.audio.pause()
				this.audio.currentTime = 0
				if (this.options.onFinish) this.options.onFinish(this.audio)
				if (this.options.loop) {
					this.audio.play();
				} else {
					clearInterval(this.timer)
				}
			} else {
				var percent = this.audio.currentTime / this.audio.duration
				if (this.options.onUpdate) this.options.onUpdate(this.audio, percent)
			}
		}
	}

	destroy() {
		this.pause()
		clearInterval(this.timer)
		document.body.removeChild(this.audio)
		this.audio = null
		this.source = null
	}


}

export default AudioControl