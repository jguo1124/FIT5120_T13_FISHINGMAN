<template>
  <article class="card">
    <header class="card-head"><h3>Size Limits</h3></header>
    <div v-if="rule" class="kv">
      <div><span class="label">Min</span><span class="value">{{ rule.min ?? '—' }} cm</span></div>
      <div><span class="label">Max</span><span class="value">{{ rule.max ?? '—' }} cm</span></div>
    </div>
    <div v-else class="empty">No size limits</div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ species: string; zone: string; dataset: Record<string, Record<string, { min:number|null; max:number|null }>> }>()
const rule = computed(() => props.dataset[props.zone]?.[props.species] || null)
</script>

<style scoped>
.card{border:1px solid #eee;border-radius:10px;padding:10px;background:#fff}
.card-head{margin-bottom:8px}
.kv{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.label{color:#666}.value{font-weight:600}.empty{color:#888}
</style>