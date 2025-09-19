import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import About from '@/pages/About.vue'
import Dashboard from '@/pages/Dashboard.vue';
import SpeciesPage from '@/pages/EndangeredSpeciesTable.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: About },
  { path: '/dashboard', component: Dashboard },
  { path: '/species', component: SpeciesPage },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});