import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../components/Dashboard.vue";


export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/dashboard" },
    { path: "/dashboard", component: Dashboard },
  ],
});
