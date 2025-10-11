import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import About from '../views/About.vue'
import EndangeredSpeciesTable from '@/Views/EndangeredSpeciesTable.vue'
import Profile from '../views/Profile.vue'      
import Favorites from '../views/Favorites.vue'
import knowledgeHub from '../views/knowledgeHub.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/dashboard', component: Dashboard },
  { path: '/endangered', name: 'endangered', component: EndangeredSpeciesTable },
  { path: '/about', component: About },
  { path: '/Home', redirect: '/' }, 
  { path: '/favorites', name: 'favorites', component: Favorites },  
  { path: '/profile', name: 'profile', component: Profile },  
  {path: '/knowledgehub', name:'knowledgehub', component: knowledgeHub},
]

export default createRouter({
  history: createWebHistory(),
  routes,
})