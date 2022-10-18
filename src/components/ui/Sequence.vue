<template>
	<div class="sequence">
		<img :src="imageSrc" />
	</div>
</template>

<script>

export default {
	name: 'ui-sequence',

	props: {
		source: { type: String, default: '' },
		name: { type: String, default: '' },
		totalFrames: { type: Number, default: 0 },
		fps: { type: Number, default: 30 },
		loop: { type: Boolean, default: false },
		autoPlay: { type: Boolean, default: false },
		fileName: { type: String, default: 'png' },
		padNum: { type: Number, default: 4 }
	},

	data () {
		return {
			myInterval: null,
			currentFrame: 0,
			images: [],
		}
	},

	computed: {
		imageSrc () {
			return this.images[this.currentFrame].src
		}
	},

	created () {
		this.preloadImages()
	},

	mounted () {
		if(this.autoPlay){
			this.play();
		}
	},

	beforeDestroy () {
		this.$off('window:load')
		this.unloadImages()
		clearInterval(this.myInterval)
	},

	methods: {

		play () {
			if(this.currentFrame >= this.totalFrames) {
				this.currentFrame = 0
			}
			clearInterval(this.myInterval);
			this.myInterval = setInterval(this.onUpdate, 1000/this.fps)
			this.$forceUpdate()
		},

		pause () {
			clearInterval(this.myInterval)
			this.$forceUpdate()
		},

		stop () {
			clearInterval(this.myInterval)
			this.currentFrame = 0
			this.$forceUpdate()
		},
		
		gotoAndPlay ( frame ) {
			clearInterval(this.myInterval)
			this.currentFrame = parseInt(frame)
			if(this.currentFrame < 0) this.currentFrame = 0
			if(this.currentFrame > this.totalFrames-1) this.currentFrame = this.totalFrames-1
			this.myInterval = setInterval(this.onUpdate, 1000/this.fps)
			this.$forceUpdate()
		},

		gotoAndStop ( frame ) {
			clearInterval(this.myInterval)
			this.currentFrame = parseInt(frame)
			if(this.currentFrame < 0) this.currentFrame = 0
			if(this.currentFrame > this.totalFrames-1) this.currentFrame = this.totalFrames-1
			this.$forceUpdate()
		},

		preloadImages () {
			let count = 0;
			for(var i =0; i<this.totalFrames; i++) {
				const image = new Image()
				image.src = require(`@/assets/images/sequence/${this.source}/${this.name + this.pad(i + 1, this.padNum)}.${this.fileName}`)
				this.images.push(image)
				image.onload = image.onerror = () => {
					count++
					if(count == this.totalFrames-1) {
						image.onload = image.onerror = undefined
						this.$emit('init')
					}
				}
			}
		},

		unloadImages () {
			this.images.forEach( image => {
				image.src = ""
				image = null
			})
			this.images = []
		},

		onUpdate () {
			this.currentFrame++
			this.$emit("update", { currentFrame: this.currentFrame, totalFrames: this.totalFrames})
			if(this.currentFrame >= this.totalFrames-1) {	
				this.$emit("finish", { currentFrame: this.currentFrame, totalFrames: this.totalFrames});
				if(this.loop) {
					this.currentFrame = 0;
				} else {
					clearInterval(this.myInterval)
				}
			}
			this.$forceUpdate()
		},

		pad (num, size) {
			var s = "0000" + num;
			return s.substr(s.length - size);
		}
	}

    
}
</script>

<style lang="scss" scoped>
.sequence{
	position: absolute;
	left: 0;
	top:0;
}
</style>