import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClock, faDice, faHandPointer, faRotateRight, faTrash, faCheck, faArrowUp, faArrowDown, faFolderPlus, faFileSignature } from '@fortawesome/free-solid-svg-icons'

library.add(faClock, faDice, faHandPointer, faRotateRight, faTrash, faCheck, faArrowUp, faArrowDown, faFolderPlus, faFileSignature)

Vue.config.productionTip = false
Vue.component('font-awesome-icon', FontAwesomeIcon)

// Add toast configuration
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Use toast plugin
Vue.use(Toast, toastOptions)

// Load data before mounting the app
store.dispatch('loadData').then(() => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
