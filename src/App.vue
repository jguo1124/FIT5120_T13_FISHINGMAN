<template>
  <div id="app">
    <HeaderBrand />
    <NavBar />
    <router-view />
    <FloatingDock title="Quick Tools" />
  </div>
</template>

<script setup lang="ts">
import HeaderBrand from '@/components/HeaderBrand.vue'
import NavBar from '@/components/NavBar.vue'
import FloatingDock from '@/components/FloatingDock.vue'
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

nav.nav {
  position: sticky;
  top: 0;
  z-index: 1000;
}
</style>