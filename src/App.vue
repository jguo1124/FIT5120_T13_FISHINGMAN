<template>
  <div id="app">
    <HeaderBrand />
    <NavBar />
    <router-view />
    <FloatingDock title="Quick Tools" />
    <footer class="footer">
      <p class="copyright">
        © GOFish Sustainably. All rights reserved
      </p>
    </footer>
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
/* Footer */
.footer {
  background: #f9f9f9;
  padding: 16px 20px;
}
.footer .copyright {
  text-align: center;
  font-size: 14px;
  color: #888;
}
</style>