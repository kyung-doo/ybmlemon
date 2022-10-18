import { gsap, Cubic } from 'gsap'

const defaultStyle = {
   position: 'absolute',
   left: 0,
   top: 0,
   width: '100%',
   height: '100%',
   backgroundColor: '#fff',
   visibility: 'visible'
}

var bindEls = {}

function flip(inElement, outElement, delay) {
   const inEl = inElement.cloneNode(true)
   const outEl = outElement ? outElement.cloneNode(true) : document.createElement('div')
   const parent = inElement.parentNode
   parent.appendChild(outEl)
   parent.appendChild(inEl)
   if(outElement) outEl.innerHTML = outElement.innerHTML
   inEl.innerHTML = inElement.innerHTML
   gsap.killTweensOf(outEl)
   gsap.killTweensOf(inEl)
   gsap.set([outEl, inEl], defaultStyle)
   gsap.set(inElement, {visibility: 'hidden'})
   gsap.set(outEl, {transformOrigin: 'bottom center', force3D: true})
   gsap.set(inEl, {transformOrigin: 'top center', scaleY:0, visibility: 'visible', force3D: true})
   gsap.to(outEl, 0.4, {delay: delay+0.3, scaleY: 0, backgroundColor: '#ccc', ease: Cubic.easeInOut })
   gsap.to(inEl, 0.4, {delay: delay+0.3, scaleY: 1, ease: Cubic.easeInOut, onComplete: () => {
      parent.removeChild(inEl)
      parent.removeChild(outEl)
      gsap.set(inElement, {visibility: 'visible'})
   }})
}


export default {
   
   bind: function ( el, binding ) {
      bindEls[binding.value.key] = el
   },

   inserted: function (el, binding) {
      if(binding.value.loadCount === 1) {
         flip(el, null, binding.value.delay)
      }
   },

   unbind: function ( el, binding ) {
      if(bindEls[binding.value.key]) {
         if(bindEls[binding.value.key] !==  el) {
            flip(bindEls[binding.value.key], el, binding.value.delay)
         }
      }
   }
}