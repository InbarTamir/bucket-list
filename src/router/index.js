import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ActivityView from '../views/ActivityView.vue'

Vue.use(VueRouter)

// Add this before routes
const useHashMode = window.location.href.includes('github.io')

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    exact: true // Only match exact path
  },
  {
    path: '/activity',
    name: 'activity',
    component: ActivityView
  }
]

const router = new VueRouter({
  mode: useHashMode ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
