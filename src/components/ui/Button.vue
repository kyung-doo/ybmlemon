<template>
	<tag :tag-name="type"
		:title="title" 
		:class="['btn ', active ? 'active' : '']">
		<slot></slot>
	</tag>
</template>

<script>
export default {
	name: 'ui-button',

	props: {
		type: { type: String, default: 'button'},
		toggle: { type: Boolean, default: false },
		toggle2: { type: Boolean, default: false },
		active: { type: Boolean, default: false },
		title: { type: String, default: '' }
	},

	data () {
		return {
			downTarget: null
		}
	},

	mounted () {
		if('ontouchstart' in window){
			this.$el.addEventListener('touchstart', this.onDownButton)
			this.$el.addEventListener('touchend', this.onUpButton)
		} else {
			this.$el.addEventListener('mousedown', this.onDownButton)
			this.$el.addEventListener('mouseup', this.onUpButton)
		}
		this.$eventBus.$on('window:touchend', this.onWindowUp)
	},

	beforeDestroy() {
		this.$eventBus.$off('window:touchend', this.onWindowUp)
		this.$el.removeEventListener('touchstart', this.onDownButton)
		this.$el.removeEventListener('touchend', this.onUpButton)
		this.$el.removeEventListener('mousedown', this.onDownButton)
		this.$el.removeEventListener('mouseup', this.onUpButton)
	},

	methods: {
		onDownButton ( e ) {
			if(e.button){
				if(e.button === 2) return
			}
			const target = e.currentTarget
			this.downTarget = target
			target.classList.add('down')
			this.$forceUpdate()
			this.$emit('button:down', e )
		},

		onUpButton ( e ) {
			if(e.button){
				if(e.button === 2) return
			}
			if(this.downTarget) {
				if(this.toggle) {
					const target = e.currentTarget
					if(target.classList.contains('active')) {
						target.classList.remove('active')
					} else {
						target.classList.add('active')
					}
				} else if(this.toggle2) {
					const target = e.currentTarget
					if(target.classList.contains('active1')) {
						target.classList.remove('active1')
						target.classList.add('active2')
					} else if(target.classList.contains('active2')) {
						target.classList.remove('active1')
						target.classList.remove('active2')
					} else {
						target.classList.add('active1')
						target.classList.remove('active2')
					}
				}
				this.$forceUpdate()
				this.$emit('button:click', e )
			}
		},

		onWindowUp ( e ) {
			if(this.downTarget) {
				this.downTarget.classList.remove('down')
				this.downTarget = null
				this.$forceUpdate()
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.btn {
	cursor: pointer;
	text-align: center;
	font-size: 13px;
	font-weight: normal;
	outline: none;
}
</style>