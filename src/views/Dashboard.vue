<!-- src/views/Dashboard.vue -->
<script setup>
import { ref, onMounted, watch, computed } from "vue";
import ControlsBar from "@/components/ControlsBar.vue";
import RegList from "@/components/RegCard.vue";
import { fetchZoneRules, fetchSpeciesList, fetchZones } from "@/lib/api";

// ---------------- state ----------------
const zones = ref([]);                       // [{ code, area }]
const zone = ref("");                       
const onDate = ref(new Date().toLocaleDateString("en-CA")); // YYYY-MM-DD
const loading = ref(false);
const errorMsg = ref("");

// optional species filter; empty string means "all species"
const species = ref("");                     
const speciesOptions = ref([]);              // [{ code, common_name }]

// raw payloads from backend before normalization/mapping for UI
const rawOne = ref(null);                    // single-species response object
const rawList = ref([]);                     // multi-species response array

// toggle to hide rows that have "no restrictions"
const hideNoRestrictions = ref(false);        

// ---------------- helpers ----------------
function normalizeRow(row, zoneCode) {
  return {
    species: { code: row.species, common_name: row.species },
    zone: { code: zoneCode || row.zone_code },
    rule: {
      min_cm: row.size_min_cm ?? null,
      max_cm: row.size_max_cm ?? null,
      daily_bag_limit: row.daily_limit ?? null,
      seasonal_limit: row.seasonal_limit ?? null,
      season_window:
        row.season_window_start || row.season_window_end
          ? { start: row.season_window_start || null, end: row.season_window_end || null }
          : null,
    },
    seasons: [],
    zone_restrictions: [],
    _source: row.source,      // 'spot' | 'general'
    _area: row.area,
  };
}

const listForRender = computed(() => {
  if (species.value) {
    return rawOne.value ? [normalizeRow(rawOne.value, zone.value)] : [];
  }
  return Array.isArray(rawList.value) ? rawList.value.map(r => normalizeRow(r, zone.value)) : [];
});

// ---------------- loaders ----------------
async function loadZones() {
  try {
    const list = await fetchZones();
    zones.value = list;
    if (!zone.value && zones.value.length) zone.value = zones.value[0].code;
  } catch (e) {
    console.warn("Failed to load zones, use fallback.", e);
    zones.value = [{ code: "Lake Bullen Merri", area: "South-West / Shipwreck Coast" }];
    zone.value = zones.value[0].code;
  }
}

async function loadSpeciesList() {
  try {
    speciesOptions.value = await fetchSpeciesList();
  } catch (e) {
    console.warn("Failed to load species list:", e);
  }
}

async function load() {
  if (!zone.value) return;

  loading.value = true;
  errorMsg.value = "";

  const prevOne = rawOne.value;
  const prevList = rawList.value;

  rawOne.value = null;
  rawList.value = [];

  try {
    const data = await fetchZoneRules({
      zoneCode: zone.value,
      onDate: onDate.value,
      species: species.value || undefined,
    });

    if (species.value) {
      rawOne.value = data || null;
    } else {
      rawList.value = Array.isArray(data) ? data : [];
    }
  } catch (e) {
    errorMsg.value = e?.message || "Failed to load regulations";
    rawOne.value = prevOne;
    rawList.value = prevList;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadZones();
  await loadSpeciesList();
  await load();
});

watch([zone, species, onDate], () => load());
</script>

<template>
  <section class="dashboard">
    <header class="dash-header">
      <h1>Regulations Dashboard</h1>
      <p class="subtitle">Select your zone and (optionally) a species to view rules.</p>
    </header>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <ControlsBar
      :zones="zones"
      v-model:zone="zone"
      v-model:onDate="onDate"
      :species-options="speciesOptions"
      v-model:species="species"
      v-model:hideNoRestrictions="hideNoRestrictions"
      :loading="loading"
      @refresh="load"
    />

    <div class="results">
      <h2>Active Regulations</h2>
      <div v-if="loading" class="skeleton">Loading regulations…</div>

      <RegList
        v-else
        :items="listForRender"
        :zone="zone"
        :onDate="onDate"
        :loading="loading"
        :hideNoRestrictions="hideNoRestrictions"
      />

      <div v-if="!loading && !listForRender.length" class="empty">
        No regulations found for {{ zone }} on {{ onDate || "today" }}.
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Page shell: centered on desktop, full-bleed on mobile */
.dashboard{
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 16px; /* add side padding for small screens */
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Fluid typography for title */
.dash-header h1{
  font-size: clamp(22px, 3.6vw, 28px);
  font-weight: 800;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
.subtitle{
  color:#64748b;
  margin: 0 0 20px;
  line-height:1.6;
  max-width: 68ch;
}

/* Make media scale nicely */
:where(img,canvas,svg,video){ max-width:100%; height:auto; }

/* States */
.alert.error{
  background:#fee2e2;
  color:#991b1b;
  border:1px solid #fecaca;
  padding:10px 12px;
  border-radius:10px;
  margin-bottom:16px;
}
.results h2{ font-size:20px; margin:18px 0 12px; }
.skeleton,.empty{
  color:#64748b;
  padding:14px;
  border:1px dashed #cbd5e1;
  border-radius:12px;
  background:linear-gradient(180deg,#fff 0%,#fbfcff 100%);
}

/* Optional: tighten padding on very narrow screens */
@media (max-width: 360px){
  .dashboard{ padding: 20px 12px; }
}
</style>
