<template>
  <article class="card">
    <header class="card-head"><h3>Catch Quotas</h3></header>
    <div v-if="rule" class="kv">
      <div><span class="label">Daily</span><span class="value">{{ show(rule.daily) }}</span></div>
      <div><span class="label">Seasonal</span><span class="value">{{ show(rule.seasonal) }}</span></div>
    </div>
    <div v-else class="empty">No quota limits</div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ species:string; zone:string; dataset:Record<string, Record<string, { daily:number|null; seasonal:number|null }>> }>()
const rule = computed(() => props.dataset[props.zone]?.[props.species] || null)
const show = (n:number|null|undefined) => (n||n===0) ? n : '—'
</script>

<style scoped>
.card{border:1px solid #eee;border-radius:10px;padding:10px;background:#fff}
.kv{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.label{color:#666}.value{font-weight:600}.empty{color:#888}
.card-head{margin-bottom:8px}
</style>