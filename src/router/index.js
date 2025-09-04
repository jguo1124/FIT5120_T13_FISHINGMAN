import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import About from '../views/About.vue'
import EndangeredSpeciesTable from '@/Views/EndangeredSpeciesTable.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/dashboard', component: Dashboard },
  { path: '/endangered', name: 'endangered', component: EndangeredSpeciesTable },
  { path: '/about', component: About },
  { path: '/Home', redirect: '/' } // optional: handle /Home
]

export default createRouter({
  history: createWebHistory(),
  routes,
})