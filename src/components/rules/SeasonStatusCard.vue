<template>
  <article class="card">
    <header class="card-head"><h3>Seasonal Status</h3></header>
    <div v-if="rule">
      <div v-if="isClosed" class="badge closed">Closed Season</div>
      <div v-else class="badge open">Open Season</div>
      <ul class="list">
        <li v-for="(c,i) in rule.closures" :key="i">{{ c.start }} → {{ c.end }}</li>
      </ul>
      <p v-if="rule.note" class="note">{{ rule.note }}</p>
    </div>
    <div v-else class="empty">No seasonal data</div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
type Closure = { start:string; end:string }
type SeasonRule = { closures: Closure[]; note?: string }
const props = defineProps<{ species:string; zone:string; dataset:Record<string, Record<string, SeasonRule>> }>()
const rule = computed<SeasonRule|null>(() => props.dataset[props.zone]?.[props.species] || null)

const today = new Date()
const isWithin = (c:Closure) => {
  const s = new Date(c.start + 'T00:00:00'); const e = new Date(c.end + 'T23:59:59')
  return today >= s && today <= e
}
const isClosed = computed(() => rule.value ? rule.value.closures?.some(isWithin) : false)
</script>

<style scoped>
.card{border:1px solid #eee;border-radius:10px;padding:10px;background:#fff}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;margin-bottom:6px}
.closed{background:#ffecec;color:#a50000;border:1px solid #ffd0d0}
.open{background:#eef9ee;color:#106d00;border:1px solid #cfeccc}
.list{margin:6px 0 0; padding-left:18px}
.note{color:#666; margin-top:6px}
.empty{color:#888}
.card-head{margin-bottom:8px}
</style>