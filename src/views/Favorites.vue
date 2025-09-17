<template>
  <section class="favorites">
    <h1>Favorites (Coming Soon)</h1>
    <p class="muted">
      You’ll be able to save species / zones / rules here for quick access.
    </p>

    <div class="grid">
      <div class="placeholder">
        <div class="icon">★</div>
        <div>Add your first favorite from Dashboard</div>
      </div>
      <div class="placeholder">
        <div class="icon">★</div>
        <div>Pin a species-size rule</div>
      </div>
      <div class="placeholder">
        <div class="icon">★</div>
        <div>Pin a zone-season rule</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 以后可以从 Pinia 的 favorites store or backend 获取收藏列表
</script>

<style scoped>
.favorites { padding: 24px; }
h1 { margin-bottom: 8px; }
.muted { color:#666; margin-bottom: 16px; }
.grid {
  display: grid; gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.placeholder {
  display: grid; place-items: center; gap: 6px;
  height: 120px; border: 1px dashed #cfd8dc; border-radius: 12px; color: #546e7a;
  background: #f8fbfc;
}
.icon { font-size: 24px; }
</style>