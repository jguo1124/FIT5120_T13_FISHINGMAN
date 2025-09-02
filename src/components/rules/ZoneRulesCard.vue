<template>
  <article class="card">
    <header class="card-head"><h3>Zone Rules</h3></header>
    <ul v-if="rules?.length" class="list">
      <li v-for="(r,i) in rules" :key="i">{{ r }}</li>
    </ul>
    <div v-else class="empty">No zone-specific rules</div>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{ zone:string; dataset:Record<string, string[]>; species:string }>()
const rules = props.dataset[props.zone] || []
</script>

<style scoped>
.card{border:1px solid #eee;border-radius:10px;padding:10px;background:#fff}
.list{margin:0;padding-left:18px}
.empty{color:#888}
.card-head{margin-bottom:8px}
</style>