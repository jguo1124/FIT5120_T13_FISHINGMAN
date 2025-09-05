import { createRouter, createWebHistory } from "vue-router";
import AIChat from "../components/AIChat.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: AIChat },
  ],
});
