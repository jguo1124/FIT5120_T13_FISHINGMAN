<script setup>
import { ref, onMounted, watch, computed } from "vue";
import ControlsBar from "@/components/ControlsBar.vue";
import RegList from "@/components/RegCard.vue";
import { fetchZoneRules, fetchSpeciesList, fetchZones } from "@/lib/api";

// ---------------- state ----------------
// [{ code, area }] loaded from backend zones endpoint
const zones = ref([]);                       // [{ code, area }]
// currently selected fishing spot (ZONE.fishing_spot)
const zone = ref("");                       
// 'YYYY-MM-DD' in local timezone; used as a filter only for ETag/consistency
const onDate = ref(new Date().toLocaleDateString("en-CA")); // YYYY-MM-DD（本地时区）
const loading = ref(false);
const errorMsg = ref("");

// optional species filter; empty string means "all species"
const species = ref("");                     
// species list for dropdown; real DB may not have common_name (we fall back to code)
const speciesOptions = ref([]);              // [{ code, common_name }]

// raw payloads from backend before normalization/mapping for UI
const rawOne = ref(null);                    // single-species response object
const rawList = ref([]);                     // multi-species response array

// toggle to hide rows that have "no restrictions" (size: none, daily: none/empty)
// actual filtering is implemented inside RegList component
const hideNoRestrictions = ref(false);        

// ---------------- helpers ----------------
// Map a row from real DB shape to the UI-friendly structure consumed by RegList.
// Keep field names consistent with your previous mock shape to minimize UI changes.
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
    seasons: [],              // no closed-season table in the real DB for now
    zone_restrictions: [],    // no zone restrictions table in the real DB for now
    _source: row.source,      // 'spot' | 'general' (helps show a badge for data source)
    _area: row.area,
  };
}

// Build the data list fed into RegList. When a species is chosen,
// we still feed an array (single element) to keep the child API uniform.
const listForRender = computed(() => {
  if (species.value) {
    return rawOne.value ? [normalizeRow(rawOne.value, zone.value)] : [];
  }
  return Array.isArray(rawList.value) ? rawList.value.map(r => normalizeRow(r, zone.value)) : [];
});

// ---------------- loaders ----------------
// Fetch zones once; fall back to a known spot locally to keep the page functional.
async function loadZones() {
  try {
    const list = await fetchZones();
    zones.value = list;
    if (!zone.value && zones.value.length) zone.value = zones.value[0].code;
  } catch (e) {
    console.warn("Failed to load zones, use fallback.", e);
    // fallback to a known existing spot so UI is not empty in local dev
    zones.value = [{ code: "Lake Bullen Merri", area: "South-West / Shipwreck Coast" }];
    zone.value = zones.value[0].code;
  }
}

// Fetch species list for the dropdown; tolerate failures and keep UI usable.
async function loadSpeciesList() {
  try {
    speciesOptions.value = await fetchSpeciesList();
  } catch (e) {
    console.warn("Failed to load species list:", e);
  }
}

// Load rules for the current (zone, species?, date) combo.
// Keeps previous good data if a request fails to avoid jarring empty UI.
async function load() {
  if (!zone.value) return;

  loading.value = true;
  errorMsg.value = "";

  // preserve previous data for graceful rollback on error
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
      rawOne.value = data || null;          // single-species response
    } else {
      rawList.value = Array.isArray(data) ? data : []; // all-species response
    }
  } catch (e) {
    errorMsg.value = e?.message || "Failed to load regulations";
    // rollback to last good state
    rawOne.value = prevOne;
    rawList.value = prevList;
  } finally {
    loading.value = false;
  }
}

// Initial page bootstrap: fetch zones, species, then first rules payload.
onMounted(async () => {
  await loadZones();
  await loadSpeciesList();
  await load();
});

// Auto-refresh when any of zone/species/onDate changes. The manual Refresh
// button in the ControlsBar also triggers `load()`, so both ways are supported.
watch([zone, species, onDate], () => load());
</script>

<template>
  <section class="dashboard">
    <header class="dash-header">
      <h1>Regulations Dashboard</h1>
      <p class="subtitle">Select your zone and (optionally) a species to view rules.</p>
    </header>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <!-- Top controls for zone/date/species. Emits `refresh` to call load(). -->
    <!-- 顶部控制条 -->
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

      <!-- Render the rules list/cards when not loading -->
      <RegList
        v-else
        :items="listForRender"
        :zone="zone"
        :onDate="onDate"
        :loading="loading"
        :hideNoRestrictions="hideNoRestrictions"
      />

      <!-- Empty-state hint when no items are available -->
      <div v-if="!loading && !listForRender.length" class="empty">
        No regulations found for {{ zone }} on {{ onDate || "today" }}.
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Page shell and basic layout */
.dashboard { max-width:1080px; margin:0 auto; padding:24px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
.dash-header h1 { font-size:28px; font-weight:800; margin:0 0 6px; letter-spacing:-0.01em; line-height:1.25; }
.subtitle { color:#64748b; margin:0 0 20px; line-height:1.6; max-width:68ch; }

/* Error/empty/skeleton states */
.alert.error { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:10px 12px; border-radius:10px; margin-bottom:16px; }
.results h2 { font-size:20px; margin:18px 0 12px; }
.skeleton, .empty { color:#64748b; padding:14px; border:1px dashed #cbd5e1; border-radius:12px; background:linear-gradient(180deg,#fff 0%,#fbfcff 100%); }
</style>
