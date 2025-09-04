<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div id="app">
    <Header />
    <main class="page-container">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style>
:root {
  --header-height: 50px;
  --footer-height: 50px;
  --container-max: 1100px;
  --container-pad: 20px;
}

/* unified centered width */
.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--container-pad);
}

/* app shell */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* main area gets full viewport minus header; becomes flex parent */
.page-container {
  flex: 1;
  min-height: calc(100vh - var(--header-height));
  padding-top: var(--header-height);
  display: flex;
  flex-direction: column;
}

/* footer sticks to bottom visually, no extra gap */
footer.footer {
  margin-top: 0;
  height: var(--footer-height);
  padding: 0 16px;
  border-top: 1px solid #eee;
  color: #666;
  display: flex;
  align-items: center;
}
html, body {
  overflow-x: hidden; 
  margin: 0;
  padding: 0;
}
</style>