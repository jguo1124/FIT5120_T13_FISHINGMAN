<template>
  <div class="pager">
    <button class="btn" @click="$emit('prev')" :disabled="page<=1">Prev</button>
    <span class="muted">Page {{ page }} / {{ totalPages }}</span>
    <button class="btn" @click="$emit('next')" :disabled="page>=totalPages">Next</button>
  </div>
</template>

<script setup>
defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});
</script>

<style scoped>
.pager { display:flex; gap:8px; align-items:center; }
.btn { border:1px solid #e2e8f0; background:#fff; border-radius:10px; padding:8px 12px; }
.muted { color:#64748b; }
</style>
