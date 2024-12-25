import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClock, faDice, faHandPointer, faRotateRight, faTrash, faCheck, faArrowUp, faArrowDown, faFolderPlus, faFileSignature, faFileExport, faFileImport, faSpinner, faCircleQuestion, faPlay, faTimes, faCircleInfo, faLightbulb, faFolderTree, faChartLine, faStopwatch, faHistory, faArrowLeft, faPlus, faFolderOpen, faEllipsisV, faChevronDown, faFilter, faFolder, faTag } from '@fortawesome/free-solid-svg-icons'
import { isIndexedDBAvailable } from '@/utils/dataService'

library.add(faClock, faDice, faHandPointer, faRotateRight, faTrash, faCheck, faArrowUp, faArrowDown, faFolderPlus, faFileSignature, faFileExport, faFileImport, faSpinner, faCircleQuestion, faPlay, faTimes, faCircleInfo, faLightbulb, faFolderTree, faChartLine, faStopwatch, faHistory, faArrowLeft, faPlus, faFolderOpen, faEllipsisV, faChevronDown, faFilter, faFolder, faTag)

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
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 3,
  newestOnTop: true
}

// Use toast plugin
Vue.use(Toast, toastOptions)

// Update app initialization
async function initApp() {
  try {
    // Check if IndexedDB is available
    const dbAvailable = await isIndexedDBAvailable()
    if (!dbAvailable) {
      Vue.$toast.warning('Local storage is not available. Your data will not persist.')
    }

    // Load data
    await store.dispatch('loadData')

    // Mount app
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  } catch (error) {
    console.error('Failed to initialize app:', error)
    Vue.$toast.error('Failed to load application data')
  }
}

initApp()
