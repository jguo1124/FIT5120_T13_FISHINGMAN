<template>
  <nav class="nav">
    <div class="container">
      <ul>
        <li><RouterLink to="/" exact>Home</RouterLink></li>
        <li><RouterLink to="/dashboard">Dashboard</RouterLink></li>
        <li><RouterLink to="/species">Species</RouterLink></li>
        <li><RouterLink to="/about">About</RouterLink></li>
      </ul>
    </div>
    <div class="underline"></div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.nav { background: #1f1f1f; color: #fff; }
.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 12px 20px;
}
ul {
  margin: 0; padding: 0; list-style: none;
  display: flex; gap: 28px; align-items: center;
  justify-content: center;
}
a {
  color: #fff; text-decoration: none; font-weight: 700;
  background: none; border: 0; cursor: pointer;
  padding: .35rem 0;
}

a.router-link-exact-active {
  border-bottom: 3px solid #3bb1e5;
  padding-bottom: .45rem;
}

.underline {
  height: 6px;
  background: #36ade1; 
}
</style>