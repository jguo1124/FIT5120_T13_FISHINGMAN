<template>
  <footer class="footer">
    <div class="inner">
      <small>© {{ year }} GoFish. All rights reserved.</small>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {

  margin-top: 0;

  height: var(--footer-height);

  padding: 0 16px;

  border-top: 1px solid #eee;
  color: #666;


  display: flex;
  align-items: center;
}
.inner { max-width: 1080px; margin: 0 auto; }
</style>