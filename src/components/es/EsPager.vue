<template>
  <div class="pager">
    <!-- Previous button (disabled on first page) -->
    <button class="btn" @click="$emit('prev')" :disabled="page<=1">Prev</button>

    <!-- Display current page and total pages -->
    <span class="muted">Page {{ page }} / {{ totalPages }}</span>

    <!-- Next button (disabled on last page) -->
    <button class="btn" @click="$emit('next')" :disabled="page>=totalPages">Next</button>
  </div>
</template>

<script setup>
// Props received from parent component
defineProps({
  page: { type: Number, required: true },        // current page
  totalPages: { type: Number, required: true },  // total number of pages
});
</script>

<style scoped>
/* Pager layout */
.pager { display:flex; gap:8px; align-items:center; }

/* Button style */
.btn { border:1px solid #e2e8f0; background:#fff; border-radius:10px; padding:8px 12px; }

/* Muted text style */
.muted { color:#64748b; }
</style>
