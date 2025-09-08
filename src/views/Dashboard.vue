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

// Init
onMounted(loadZones);
</script>

<template>
  <section class="dashboard">
    <header class="dash-header">
      <h1>Regulations Dashboard</h1>
      <p class="subtitle">
        Select a zone and date to view all species; optionally filter by species.
      </p>
    </header>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <!-- Centered card for the step-by-step controls -->
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

      <div v-if="!loading && step < 3" class="empty">
        Select a zone and date to view regulations.
      </div>
      <div
        v-else-if="!loading && step >= 3 && !listForRender.length"
        class="empty"
      >
        No regulations found for {{ zone }} on {{ onDate || "—" }}.
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

/* Title */
.dash-header h1 {
  font-size: clamp(22px, 3.6vw, 28px);
  font-weight: 800;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
.subtitle {
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.6;
  max-width: 68ch;
}

/* Center card for controls */
.wizard-card {
  max-width: 820px;
  margin: 12px auto 20px;
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .05), 0 10px 24px rgba(0, 0, 0, .06);
}

/* States */
.alert.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 16px;
}
.results h2 { font-size: 20px; margin: 18px 0 12px; }
.skeleton, .empty {
  color: #64748b;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

/* Small screens */
@media (max-width: 360px) {
  .dashboard { padding: 20px 12px; }
}
</style>
