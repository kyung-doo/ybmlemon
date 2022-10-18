<template>
  <transition name="fade">
    <div
      v-show="isShow"
      @click="handleClickOverlay"
      :class="['vc-overlay', dialog.addClass]"
      id="vueConfirm">

      <transition name="zoom">
        <div v-if="isShow" ref="vueConfirmDialog" class="vc-container">
          <span class="vc-text-grid">
            <h4 v-if="dialog.title" class="vc-title">{{ dialog.title }}</h4>
            <p v-if="dialog.message" class="vc-text" v-html="dialog.message"></p>
            <p v-if="dialog.submessage" class="vc-sub-text" v-html="dialog.submessage"></p>
            <span v-if="dialog.auth">
              <input
                v-focus
                v-model="password"
                @keyup.13="e => handleClickButton(e, true)"
                class="vc-input"
                type="password"
                name="vc-password"
                placeholder="Password"
                autocomplete="off"
              />
            </span>
          </span>
          <div
            class="vc-btn-grid"
            :class="{ isMono: !dialog.button.no || !dialog.button.yes }">
            <button
              v-for="(button, index) in dialog.button"
              :key="button.name"
              @click.stop="e => handleClickButton(e, button.value)"
              :class="['vc-btn', index < dialog.button.length-1 ? 'left' : '']">
              {{ button.name }}
            </button>
          </div>
          <button class="vc-close-btn" @click.stop="e => handleClickButton(e, dialog.button[0].value)"></button>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import { events } from './events'

Vue.directive('focus', {
  inserted: function(el) {
    el.focus()
  }
})

const Component = {
  name: 'VueConfirmDialog',
  props: {
    backClickClose: { type: Boolean, default: false }
  },
  data() {
    return {
      isShow: false,
      password: null,
      dialog: {
        addClass: '',
        auth: false,
        title: '',
        message: '',
        submessage: '',
        button: []
      },
      params: {}
    }
  },
  methods: {
    resetState() {
      this.password = null
      this.dialog = {
        addClass: '',
        auth: false,
        title: '',
        message: '',
        submessage: '',
        button: {},
        callback: () => {}
      }
    },
    handleClickButton({ target }, confirm) {
      if (target.id == 'vueConfirm') return
      if (confirm && this.dialog.auth && !this.password) return
      this.isShow = false
      // callback
      if (this.params.callback) {
        this.params.callback(confirm, this.password)
      }
    },
    handleClickOverlay({ target }) {
      if(!this.backClickClose) return
      if (target.id == 'vueConfirm') {
        this.isShow = false
        // callback
        if (this.params.callback) {
          this.params.callback(false, this.password)
        }
      }
    },
    handleKeyUp({ keyCode }) {
      if (keyCode == 27) {
        this.handleClickOverlay({ target: { id: 'vueConfirm' } })
      }
      if (keyCode == 13) {
        this.handleClickButton({ target: { id: '' } }, true)
      }
    },
    open(params) {
      this.resetState()
      this.params = params
      this.isShow = true
      // set params to dialog state
      Object.entries(params).forEach(param => {
        if (typeof param[1] == typeof this.dialog[param[0]]) {
          this.dialog[param[0]] = param[1]
        }
      })
    }
  },
  mounted() {
    if (!document) return
    events.$on('open', this.open)
    events.$on('close', () => {
      this.handleClickOverlay({ target: { id: 'vueConfirm' } })
    })
    // document.addEventListener('keyup', this.handleKeyUp)
  },
  beforeDestroy() {
    // document.removeEventListener('keyup', this.handleKeyUp)
  }
}

export default Component
</script>

<style lang="scss">
:root {
  --title-color: black;
  --message-color: black;
  --sub-message-color: rgb(88, 88, 88);
  --overlay-background-color: #0000004a;
  --container-box-shadow: #0000004a 0px 3px 8px 0px;
  --base-background-color: #ffffff;
  --button-color: #4083ff;
  --button-background-color: #ffffff;
  --button-border-color: #e0e0e0;
  --button-background-color-disabled: #f5f5f5;
  --button-background-color-hover: #f5f5f5;
  --button-box-shadow-active: inset 0 2px 0px 0px #00000014;
  --input-background-color: #ebebeb;
  --input-background-color-hover: #dfdfdf;
  --font-size-m: 16px;
  --font-size-s: 14px;
  --font-size-ss: 12px;
  --font-weight-black: 900;
  --font-weight-bold: 700;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --font-weight-light: 300;
}

/**
* Dialog
*/

.vc-overlay *,
.vc-overlay *:before,
.vc-overlay *:after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  text-decoration: none;
  -webkit-touch-callout: none;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

.vc-title {
  color: var(--title-color);
  padding: 0 1rem;
  width: 100%;
  font-weight: var(--font-weight-black);
  text-align: center;
  font-size: var(--font-size-m);
  line-height: initial;
  margin-bottom: 5px;
}
.vc-text {
  color: var(--message-color);
  padding: 0 1rem;
  width: 100%;
  font-weight: var(--font-weight-medium);
  text-align: center;
  font-size: var(--font-size-s);
  line-height: initial;
}
.vc-sub-text {
  color: rgb(88, 88, 88);
  padding: 0 1rem;
  width: 100%;
  font-weight: 500;
  text-align: center;
  font-size: 20px;
  line-height: initial;
  margin-top: 10px;
}
.vc-overlay {
  background-color: var(--overlay-background-color);
  width: 100%;
  height: 100%;
  transition: all 0.1s ease-in;
  position: absolute;
  left: -50%;
  top: 0;
  width: 200%;
  height: 100%;
  z-index: 999999999999;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: baseline;
}
.vc-container {
  position: relative;
  background-color: var(--base-background-color);
  border-radius: 1rem;
  width: 286px;
  height: auto;
  display: grid;
  grid-template-rows: 1fr max-content;
  box-shadow: var(--container-box-shadow);
}
.vc-text-grid {
  padding: 1rem;
  flex-direction: column;
}
.vc-btn-grid {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  grid-template-columns: 1fr 1fr;
  border-radius: 0 0 1rem 1rem;
  overflow: hidden;
}
.vc-btn {
  display: block;
  width: 100%;
  border-radius: 0 0 1rem 0;
  color: var(--button-color);
  background-color: var(--button-background-color);
  border: 0;
  font-size: 1rem;
  border-top: 1px solid var(--button-border-color);
  cursor: pointer;
  font-weight: var(--font-weight-bold);
  outline: none;
  min-height: 50px;
}
.vc-btn:hover {
  background-color: var(--button-background-color-hover);
}
.vc-btn:disabled {
  background-color: var(--button-background-color-disabled);
}
.vc-btn:active {
  box-shadow: var(--button-box-shadow-active);
}
.vc-btn.left {
  border-radius: 0;
  border-right: 1px solid var(--button-border-color);
}
.vc-input[type='password'] {
  width: 100%;
  outline: none;
  border-radius: 8px;
  height: 35px;
  border: 0;
  margin: 5px 0;
  background-color: var(--input-background-color);
  padding: 0 0.5rem;
  font-size: var(--font-size-m);
  transition: 0.21s ease;
}
.vc-input[type='password']:hover,
.vc-input[type='password']:focus {
  background-color: var(--input-background-color-hover);
}
.vc-close-btn {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 96px;
  height: 100px;
  background: url('~@/assets/images/common/pop_close.png') no-repeat;
}

</style>
