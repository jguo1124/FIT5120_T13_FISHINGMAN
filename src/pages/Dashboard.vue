<!-- src/views/Dashboard.vue -->
<script setup>
import { ref, onMounted, watch, computed } from "vue";
import WizardControls from "@/components/WizardControls.vue";
import RegList from "@/components/RegCard.vue";
import { fetchZoneRules, fetchSpeciesList, fetchZones } from "@/lib/api";

// ---------- state ----------
const zones = ref([]);
const zone = ref("");
const onDate = ref("");                 // chosen after Zone
const species = ref("");                // optional client-side filter
const speciesOptions = ref([]);         // [{ code, common_name }]
const speciesLoading = ref(false);

const step = ref(1);                    // 1=Zone, 2=Date, 3=Species (optional; results already visible)
const loading = ref(false);
const errorMsg = ref("");
const hideNoRestrictions = ref(false);  // passed to result cards (default false when no toggle)

// Full regulations for ALL species after Zone + Date are selected (server response)
const rawList = ref([]);

// ---------- helpers ----------
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
          ? {
              start: row.season_window_start || null,
              end: row.season_window_end || null,
            }
          : null,
    },
    seasons: [],
    zone_restrictions: [],
    _source: row.source,
    _area: row.area,
  };
}

// Compute render list: if species is selected, filter on client; otherwise show all
const listForRender = computed(() => {
  const all = Array.isArray(rawList.value)
    ? rawList.value.map((r) => normalizeRow(r, zone.value))
    : [];
  if (!species.value) return all;
  return all.filter((nr) => nr?.species?.code === species.value);
});

// ---------- loaders ----------
async function loadZones() {
  try {
    const list = await fetchZones();
    zones.value = list;
    if (!zone.value && list?.length) zone.value = list[0].code;
  } catch (e) {
    console.warn("Failed to load zones, use fallback.", e);
    zones.value = [
      { code: "Lake Bullen Merri", area: "South-West / Shipwreck Coast" },
    ];
    zone.value = zones.value[0].code;
  } finally {
    step.value = zone.value ? 2 : 1;
  }
}

// After Zone + Date: load ALL regulations (no species parameter)
async function loadAllRegulations() {
  if (!zone.value || !onDate.value) return;
  loading.value = true;
  errorMsg.value = "";
  try {
    const data = await fetchZoneRules({
      zoneCode: zone.value,
      onDate: onDate.value,
    });
    rawList.value = Array.isArray(data) ? data : [];
    await loadSpeciesOptionsOrDerive();
  } catch (e) {
    errorMsg.value = e?.message || "Failed to load regulations";
    rawList.value = [];
  } finally {
    loading.value = false;
  }
}

// Prefer getting candidate species from backend; if it fails, derive from rawList response
async function loadSpeciesOptionsOrDerive() {
  speciesLoading.value = true;
  try {
    const list = await fetchSpeciesList(zone.value, onDate.value);
    const arr = Array.isArray(list) ? list : [];
    if (arr.length) {
      speciesOptions.value = arr;
    } else {
      const uniq = [...new Set(rawList.value.map((r) => r.species))];
      speciesOptions.value = uniq.map((code) => ({ code, common_name: code }));
    }
  } catch (e) {
    console.warn("fetchSpeciesList failed, deriving from regulations.", e);
    const uniq = [...new Set(rawList.value.map((r) => r.species))];
    speciesOptions.value = uniq.map((code) => ({ code, common_name: code }));
  } finally {
    speciesLoading.value = false;
  }
}

// ---------- step transitions ----------
function onZoneChanged(v) {
  zone.value = v;
  onDate.value = "";
  species.value = "";
  rawList.value = [];
  speciesOptions.value = [];
  step.value = zone.value ? 2 : 1;
}

function onDateChanged(v) {
  onDate.value = v;
  species.value = "";
  rawList.value = [];
  speciesOptions.value = [];
  step.value = zone.value && onDate.value ? 3 : 2;
  // Immediately load ALL regulations once date is chosen
  loadAllRegulations();
}

function onSpeciesChanged(v) {
  species.value = v; // client-side filter only (no extra request)
}

// Fallback guards to advance steps even if child events are not emitted
watch(zone, (v) => {
  step.value = v ? Math.max(step.value, 2) : 1;
});
watch(onDate, (v) => {
  if (zone.value && v) step.value = 3;
});

const stepPills = computed(() => ([
  { id: 1, label: "Zone", icon: "📍", state: step.value >= 1 ? (step.value > 1 ? "done" : "current") : "todo" },
  { id: 2, label: "Date", icon: "🗓️", state: step.value >= 2 ? (step.value > 2 ? "done" : "current") : "todo" },
  { id: 3, label: "Species", icon: "🐟", state: step.value >= 3 ? "current" : "todo" },
]));

// Init
onMounted(loadZones);
</script>

<template>
  <section class="dashboard">
    <!-- top hero with title and subtitle -->
    <header class="dash-hero wave-bg">
      <div class="dash-hero__inner">
        <h1>Plan your trip</h1>
        <p class="subtitle">
          Select a zone and date to view all species; optionally filter by species.
        </p>
        <p class="subtitle">
          Ensure regulations are followed.
        </p>
      </div>
    </header>

    <!-- steps pills -->
    <nav class="pills">
      <ol class="pills__list">
        <li
          v-for="p in stepPills"
          :key="p.id"
          class="pills__item"
          :data-state="p.state"
        >
          <span class="pills__num">
            <span>{{ p.id }}</span>
          </span>
          <span class="pills__icon" aria-hidden="true">{{ p.icon }}</span>
          <span class="pills__label">{{ p.label }}</span>
        </li>
      </ol>
    </nav>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <!-- middle controls card -->
    <div class="wizard-card">
      <WizardControls
        :zones="zones"
        :zone="zone"
        :onDate="onDate"
        :species="species"
        :speciesOptions="speciesOptions"
        :speciesLoading="speciesLoading"
        :step="step"
        :loading="loading"
        @update:zone="onZoneChanged"
        @update:onDate="onDateChanged"
        @update:species="onSpeciesChanged"
      />
    </div>

    <!-- results -->
    <div class="results">
      <h2>Active Regulations</h2>

      <div v-if="loading" class="skeleton">Loading regulations...</div>

      <RegList
        v-else
        :items="listForRender"
        :zone="zone"
        :onDate="onDate"
        :loading="loading"
        :hideNoRestrictions="hideNoRestrictions"
      />

      <div v-if="!loading && step < 3" class="empty">
        Select a zone and date to view regulations.
      </div>
      <div
        v-else-if="!loading && step >= 3 && !listForRender.length"
        class="empty"
      >
        No regulations found for {{ zone }} on {{ onDate || "-" }}.
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Page shell */
.dashboard {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* banner-like hero */
.dash-hero {
  border-radius: 14px;
  padding: 16px 18px;
  margin: 0 0 10px;
  box-shadow: 0 4px 14px rgba(59,130,246,0.06), 0 1px 2px rgba(0,0,0,0.04);
}

/* centered inner content */
.dash-hero__inner {
  max-width: 880px;
  margin: 0 auto;
}

/* background wave pattern */
.wave-bg {
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(59,130,246,.12) 0%, rgba(59,130,246,0) 60%),
    repeating-linear-gradient(
      135deg,
      rgba(59,130,246,.08) 0 10px,
      rgba(59,130,246,0) 10px 26px
    );
}
.dash-hero h1 {
  font-size: clamp(22px, 3.4vw, 28px);
  font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: #0f172a; 
}

.subtitle {
  color: #475569;         
  margin: 0;
  line-height: 1.5;
  max-width: 65ch;
  font-size: clamp(13px, 1.4vw, 15px);
}

.pills { margin-top: 10px; }

/* steps pills */
.pills__list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(10px, 2vw, 16px);
  max-width: 880px;      
  margin-left: auto;
  margin-right: auto;
  justify-items: start;   
}
.pills__item {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}
.pills__num {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(89, 195, 214, 0.28);          
  color: #21c8e5;              
  border: 2px solid #21c8e5;    
  font-weight: 800;
}
.pills__icon { font-size: 18px; }
.pills__label {
  font-weight: 700;
  color: #0f172a;
}

.pills__item[data-state="current"] {
  outline: 2px solid rgba(59,130,246,.18);
  outline-offset: 0;
  box-shadow: 0 1px 2px rgba(59,130,246,.10);
}
.pills__item[data-state="done"] .pills__label { color: #1f2937; }

.wizard-card {
  max-width: 820px;
  margin: 12px auto 20px;
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 10px 24px rgba(0,0,0,.06);
}

.alert.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
  margin: 10px 0 14px;
}
.results h2 { font-size: 20px; margin: 18px 0 12px; }
.skeleton, .empty {
  color: #64748b;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

@media (max-width: 720px) {
  .pills__list{
    grid-template-columns: 1fr;
    max-width: 560px;     
  }
}
@media (max-width: 360px) {
  .dashboard { padding: 20px 12px; }
}
</style>