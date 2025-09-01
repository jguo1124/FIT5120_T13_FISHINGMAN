<template>
  <nav class="nav">
    <RouterLink to="/" class="link">Home</RouterLink>
    <RouterLink to="/dashboard" class="link">Dashboard</RouterLink>
    <RouterLink to="/about" class="link">About</RouterLink>
  </nav>
</template>

<script setup lang="ts">
import router from './router' 
</script>

<style scoped>
.nav { display: flex; gap: 16px; }
.link { text-decoration: none; color: #333; }
.link:hover { text-decoration: underline; }
</style>