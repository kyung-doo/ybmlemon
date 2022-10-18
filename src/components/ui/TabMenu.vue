<template>
	<div class="tab-menu">
		<slot></slot>
	</div>
</template>

<script>
export default {
	name: 'ui-tab-menu',
	
	props: {
		activeIndex: { type: Number, default: 0},
	},

	data () {
		return {
			active : 0
		}
	},

	mounted () {
		this.changeTab( this.activeIndex )
		this.active = this.activeIndex
		this.$children.forEach(( menu, i ) => {
			menu.$on('button:click', ( e ) => this.clickMenu(e, i))
		})
	},

	beforeDestroy() {
		this.$children.forEach(( menu, i ) => {
			menu.$off('button:click')
		})
	},

	methods: {
		clickMenu ( e, idx ) {
			this.$children.forEach(( menu, i ) => {
				if(idx == i) {
					if(!menu.$props.toggle) {
						this.$el.children[i].classList.add('active')
						this.active = i + 1
						this.$emit('tabmenu:change', idx+1)
					} else {
						if(!this.$el.children[i].classList.contains('active')) {
							this.$el.children[i].classList.remove('active')
							this.active = 0
							this.$emit('tabmenu:change', 0)
						} else {
							this.$el.children[i].classList.add('active')
							this.active = i + 1
							this.$emit('tabmenu:change', idx+1)
						}
					}
				} else {
					this.$el.children[i].classList.remove('active')
				}
			})
		},

		changeTab ( idx ) {
			this.$children.forEach(( menu, i ) => {
				if(idx == i+1) {
					this.$el.children[i].classList.add('active')
					this.active = i + 1
				} else {
					this.$el.children[i].classList.remove('active')
				}
			})
		}
	}
}
</script>