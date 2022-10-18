import Slider from './js/vue-range-slider'
import './vue-range-slider.css'

Slider.install = ( Vue ) => {
  Vue.component(Slider.name, Slider)
}

export default Slider
