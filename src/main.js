import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClock, faDice, faHandPointer, faRotateRight, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons'

library.add(faClock, faDice, faHandPointer, faRotateRight, faTrash, faCheck)

Vue.config.productionTip = false
Vue.component('font-awesome-icon', FontAwesomeIcon)

// Load data before mounting the app
store.dispatch('loadData').then(() => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
