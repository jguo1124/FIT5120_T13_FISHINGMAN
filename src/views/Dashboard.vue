<template>
  <main class="dash">
    <header class="top">
      <h2>Dashboard</h2>
      <small class="muted">Last updated: {{ lastUpdated }}</small>
    </header>

    <section class="filters">
      <label class="ctl">
        <span>Species</span>
        <input v-model="species" list="species-list" placeholder="e.g. Snapper / Bream" />
        <datalist id="species-list">
          <option v-for="s in allSpecies" :key="s" :value="s" />
        </datalist>
      </label>

      <label class="ctl">
        <span>Zone</span>
        <select v-model="zone">
          <option value="">Select a zone</option>
          <option v-for="z in allZones" :key="z" :value="z">{{ z }}</option>
        </select>
      </label>

      <label class="ctl">
        <span>Keyword</span>
        <input v-model="keyword" type="text" placeholder="Search by keyword..." />
      </label>

      <button class="btn" @click="simulateDatasetUpdate">Refresh</button>
    </section>

    <section v-if="!zone" class="notice">
      <strong>No zone selected.</strong> Choose a zone to see zone-specific rules.
    </section>

    <section class="grid">
      <SizeLimitsCard :species="species" :zone="zone || 'default'" :dataset="sizeRules" />
      <QuotasCard :species="species" :zone="zone || 'default'" :dataset="quotaRules" />
      <SeasonStatusCard :species="species" :zone="zone || 'default'" :dataset="seasonRules" />
      <ZoneRulesCard :species="species" :zone="zone || 'default'" :dataset="zoneRules" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SizeLimitsCard from '../components/rules/SizeLimitsCard.vue'
import QuotasCard from '../components/rules/QuotasCard.vue'
import SeasonStatusCard from '../components/rules/SeasonStatusCard.vue'
import ZoneRulesCard from '../components/rules/ZoneRulesCard.vue'

const species = ref('Snapper')
const zone = ref('Bay A')
const keyword = ref('')
const lastUpdated = ref(new Date().toISOString())
const allSpecies = ['Snapper', 'Bream', 'Flathead']
const allZones = ['Bay A', 'Bay B', 'default']

const sizeRules = ref({
  'Bay A': { Snapper: { min: 28, max: null }, Bream: { min: 23, max: null } },
  'Bay B': { Snapper: { min: 30, max: 60 } },
  default: { Flathead: { min: 27, max: null } }
})
const quotaRules = ref({
  'Bay A': { Snapper: { daily: 3, seasonal: 10 } },
  'Bay B': { Snapper: { daily: 2, seasonal: null }, Bream: { daily: 10, seasonal: null } },
  default: { Flathead: { daily: null, seasonal: null } }
})
const seasonRules = ref({
  'Bay A': { Snapper: { closures: [{ start: '2025-09-01', end: '2025-10-15' }], note: 'Spawning closure applies' } },
  default: { Bream: { closures: [], note: 'No closures recorded' } }
})
const zoneRules = ref({
  'Bay A': ['No fishing within 50m of markers', 'Single barbless hook required'],
  'Bay B': ['Closed area near reef zone from 1 Oct – 1 Dec'],
  default: []
})

function simulateDatasetUpdate() {
  if (sizeRules.value['Bay A']?.Snapper) {
    sizeRules.value['Bay A'].Snapper.min = 30
  }
  lastUpdated.value = new Date().toISOString()
}
</script>

<style scoped>
.dash { display:grid; gap:12px; padding:12px; }
.top { display:flex; align-items:baseline; gap:10px; }
.muted { color:#7a8190; }
.filters { display:flex; justify-content:center; align-items:flex-end; flex-wrap:wrap; gap:16px; }
.ctl { display:flex; flex-direction:column; gap:4px; font-size:12px; }
.ctl input,.ctl select { padding:6px 8px; border:1px solid #d7dbea; border-radius:8px; }
.btn { padding:6px 10px; border:1px solid #cfd6f0; border-radius:8px; background:#fff; cursor:pointer; }
.notice { padding:8px 10px; border:1px solid #ffe0e0; background:#fff7f7; border-radius:8px; font-size:13px; }
.grid { display:grid; grid-template-columns:repeat(2,minmax(220px,1fr)); gap:12px; max-width:720px; margin:0 auto; }
:deep(.card){ border:1px solid #eee; border-radius:10px; padding:10px; background:#fff; }
:deep(.card-head h3){ margin:0 0 6px; font-size:16px; }
</style>