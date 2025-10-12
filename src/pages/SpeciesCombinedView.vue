<script setup>
import { ref, onMounted, watch, computed } from "vue";
import WizardControls from "@/components/WizardControls.vue";
import RegList from "@/components/RegCard.vue";
import EsSpeciesCard from "@/components/es/EsSpeciesCard.vue"; 
import { fetchZones } from "@/lib/api";

/* ---------- state ---------- */
const zones = ref([]);
const zone = ref("");
const onDate = ref("");
const step = ref(1);
const loading = ref(false);
const errorMsg = ref("");

// Response shape from combined API: { endangered:[], invasive:[], general:[] }
const groups = ref(null);

/* ---------- loaders ---------- */
async function loadZones() {
  try {
    const list = await fetchZones();
    zones.value = list;
    zone.value = "";
  } catch (e) {
    console.warn("Failed to load zones, using fallback.", e);
    zones.value = [{ code: "Lake Bullen Merri", area: "South-West / Shipwreck Coast" }];
    zone.value = "";
  } finally {
    step.value = 1;
  }
}

async function loadCombinedSpecies() {
  // Only load after both zone and date are selected
  if (!zone.value || !onDate.value) return;
  loading.value = true;
  errorMsg.value = "";
  groups.value = null;
  try {
    const resp = await fetch(
      `/api/v1/species_combined/${encodeURIComponent(zone.value)}?onDate=${encodeURIComponent(onDate.value)}`
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    groups.value = data.groups; // { endangered, invasive, general }
  } catch (e) {
    errorMsg.value = e?.message || "Failed to load combined species";
  } finally {
    loading.value = false;
  }
}

/* ---------- step transitions ---------- */
function onZoneChanged(v) {
  zone.value = v;
  onDate.value = "";
  groups.value = null;
  step.value = zone.value ? 2 : 1;
}
function onDateChanged(v) {
  onDate.value = v;
  groups.value = null;
  step.value = zone.value && onDate.value ? 3 : 2;
  loadCombinedSpecies();
}

const stepPills = computed(() => ([
  { id: 1, label: "Zone",    icon: "📍", state: step.value >= 1 ? (step.value > 1 ? "done" : "current") : "todo" },
  { id: 2, label: "Date",    icon: "🗓️", state: step.value >= 2 ? (step.value > 2 ? "done" : "current") : "todo" },
  { id: 3, label: "Results", icon: "🐟", state: step.value >= 3 ? "current" : "todo" },
]));

/* ---------- map backend rows to the structures expected by RegCard / EsSpeciesCard ---------- */
function toRegCardItem(sp, zoneCode, onDateStr) {
  return {
    species: { code: sp.species, common_name: sp.species },
    zone: { code: zoneCode },
    rule: {
      min_cm: sp.min_size_cm ?? null,
      max_cm: sp.max_size_cm ?? null,
      daily_bag_limit: sp.daily_limit ?? null,
      seasonal_limit: null,
      season_window: null,
    },
    seasons: [],
    zone_restrictions: [],
    _source: sp.source,
    _area: sp.area,
    _onDate: onDateStr,
  };
}

function onBack() {
  if (step.value === 1) {
    alert("This is the first step, you can't go back.");
    return;
  }

  loading.value = false;
  errorMsg.value = "";

  if (step.value === 3) {
    onDate.value = "";
    groups.value = null;
    step.value = 2;
  } else if (step.value === 2) {
    zone.value = "";
    onDate.value = "";
    groups.value = null;
    step.value = 1;
  } else {
    step.value = 1;
  }
  generalPage.value = 1;
}

function onNext() {
  if (!zone.value) return;
  onDate.value = "";
  groups.value = null;
  step.value = 2;
}

function onShow() {
  if (!zone.value || !onDate.value) return;
  step.value = 3;
  loadCombinedSpecies();
}

function onClearAll() {
  loading.value = false;
  errorMsg.value = "";
  zone.value = "";
  onDate.value = "";
  species.value = "";
  groups.value = null;
  step.value = 1;
  generalPage.value = 1;
}

const species = ref("");
const speciesLoading = ref(false);

const speciesOptions = computed(() => {
  const map = new Map();
  const buckets = [
    groups.value?.endangered || [],
    groups.value?.invasive || [],
    groups.value?.general || []
  ];
  for (const arr of buckets) {
    for (const sp of arr) {
      const code = sp?.species;
      if (!code) continue;
      if (!map.has(code)) {
        map.set(code, { code, common_name: sp.common_name || sp.species });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.common_name || a.code).localeCompare(String(b.common_name || b.code))
  );
});

const filteredEndangered = computed(() => {
  if (!species.value) return endangeredImageItems.value;
  return endangeredImageItems.value.filter(s => s.species_code === species.value);
});

const filteredInvasive = computed(() => {
  if (!species.value) return cardsInvasive.value;
  return cardsInvasive.value.filter(it => it.species.code === species.value);
});

const filteredGeneral = computed(() => {
  if (!species.value) return cardsGeneral.value;
  return cardsGeneral.value.filter(it => it.species.code === species.value);
});

// For RegCard (invasive / general groups)
const cardsInvasive = computed(() =>
  (groups.value?.invasive || []).map(sp => toRegCardItem(sp, zone.value, onDate.value))
);
const cardsGeneral = computed(() =>
  (groups.value?.general || []).map(sp => toRegCardItem(sp, zone.value, onDate.value))
);

// For EsSpeciesCard (endangered group with images)
const FALLBACK_IMG = "https://www.eftta.com/fileadmin/user_upload/FISHPROTECT_white__2.jpg";
const endangeredImageItems = computed(() =>
  (groups.value?.endangered || []).map(sp => ({
    species_code: sp.species,
    common_name: sp.species,              // FISH table has no common_name; use species as placeholder
    scientific_name: sp.scientific_name || "", // leave blank if not available
    conservation_status: sp.endangered_status || "",
    distribution: sp.distribution || "",  // may be missing; card will show '-'
    image_url: sp.image || FALLBACK_IMG,  // repo returns image/sources
    source: sp.sources || sp.source || ""
  }))
);

const GENERAL_PAGE_SIZE = 6;
const generalPage = ref(1);

const generalTotalPages = computed(() => {
  const total = filteredGeneral.value.length;
  return Math.max(1, Math.ceil(total / GENERAL_PAGE_SIZE));
});

const pagedGeneral = computed(() => {
  const start = (generalPage.value - 1) * GENERAL_PAGE_SIZE;
  return filteredGeneral.value.slice(start, start + GENERAL_PAGE_SIZE);
});

watch(filteredGeneral, () => {
  generalPage.value = 1;
});

/* ---------- init ---------- */
onMounted(loadZones);
</script>

<template>
  <section class="dashboard">
    <!-- Header -->
    <header class="dash-hero wave-bg">
      <div class="dash-hero__inner">
        <h1>Unified Regulations Dashboard</h1>
        <p class="subtitle">
          Select a zone and date to view endangered (with images), invasive and general species.
        </p>
      </div>
    </header>

    <!-- Step pills -->
    <nav class="pills">
      <ol class="pills__list">
        <li v-for="p in stepPills" :key="p.id" class="pills__item" :data-state="p.state">
          <span class="pills__num"><span>{{ p.id }}</span></span>
          <span class="pills__icon" aria-hidden="true">{{ p.icon }}</span>
          <span class="pills__label">{{ p.label }}</span>
        </li>
      </ol>
    </nav>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <!-- Controls -->
    <div class="wizard-card">
      <WizardControls
        :zones="zones"
        :zone="zone"
        :onDate="onDate"
        :step="step"
        :loading="loading"
        :species="species"
        :speciesOptions="speciesOptions"
        :speciesLoading="speciesLoading"
        :key="step"
        @update:zone="onZoneChanged"
        @update:onDate="onDateChanged"
        @update:species="v => (species.value = v)"
        @back="onBack"
        @next="onNext"
        @show="onShow"
        @clear-all="onClearAll"
      />
    </div>

    <!-- Results -->
    <div class="results">
      <h2>Species Regulations</h2>
      <div v-if="loading" class="skeleton">Loading regulations...</div>

      <template v-else-if="groups">
        <!-- 🔴 Endangered: image cards (EsSpeciesCard) -->
        <section class="band danger">
          <div class="band__head">
            <span class="dot red"></span>
            <h3>Endangered / No-take ({{ filteredEndangered.length }})</h3>
          </div>
          <div class="grid-cards">
            <EsSpeciesCard
              v-for="sp in filteredEndangered"
              :key="sp.species_code"
              :sp="sp"
            />
          </div>
          <div v-if="filteredEndangered.length === 0" class="empty">No endangered species in this zone.</div>
        </section>

        <section class="band warning">
          <div class="band__head">
            <span class="dot yellow"></span>
            <h3>Invasive ({{ filteredInvasive.length }})</h3>
          </div>
          <RegList
            :items="filteredInvasive"
            :zone="zone"
            :onDate="onDate"
            :loading="loading"
            :hideNoRestrictions="false"
          />
        </section>

        <section class="band neutral">
          <div class="band__head">
            <span class="dot green"></span>
            <h3>General ({{ filteredGeneral.length }})</h3>
          </div>
          <RegList
            :items="pagedGeneral"
            :zone="zone"
            :onDate="onDate"
            :loading="loading"
            :hideNoRestrictions="false"
          />
        </section>

        <div v-if="generalTotalPages > 1" class="pager">
          <button
            class="btn ghost"
            :disabled="generalPage <= 1 || loading"
            @click="generalPage = Math.max(1, generalPage - 1)"
          >
            Previous
          </button>

          <span class="pager-info">
            Page {{ generalPage }} of {{ generalTotalPages }}
          </span>

          <button
            class="btn ghost"
            :disabled="generalPage >= generalTotalPages || loading"
            @click="generalPage = Math.min(generalTotalPages, generalPage + 1)"
          >
            Next
          </button>
        </div>
      </template>

      <div v-else-if="!loading && step < 3" class="empty">
        Select a zone and date to view regulations.
      </div>
      <div v-else-if="!loading && step >= 3 && !groups" class="empty">
        No regulations found for {{ zone }} on {{ onDate || "-" }}.
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Page shell */
.dashboard {
  max-width: 1080px; margin: 0 auto; padding: 24px 16px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Banner-like header */
.dash-hero {
  border-radius: 14px; padding: 16px 18px; margin: 0 0 10px;
  box-shadow: 0 4px 14px rgba(59,130,246,0.06), 0 1px 2px rgba(0,0,0,0.04);
}
.dash-hero__inner { max-width: 880px; margin: 0 auto; }
.wave-bg {
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(59,130,246,.12) 0%, rgba(59,130,246,0) 60%),
    repeating-linear-gradient(135deg, rgba(59,130,246,.08) 0 10px, rgba(59,130,246,0) 10px 26px);
}
.dash-hero h1 { font-size: clamp(22px, 3.4vw, 28px); font-weight: 800; margin: 0 0 4px; color: #0f172a; }
.subtitle { color: #475569; margin: 0; line-height: 1.5; max-width: 65ch; font-size: clamp(13px, 1.4vw, 15px); }

/* Step pills */
.pills { margin-top: 10px; }
.pills__list {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: clamp(10px, 2vw, 16px); max-width: 880px; margin: 0 auto; justify-items: start;
}
.pills__item {
  display: grid; grid-template-columns: auto auto 1fr; align-items: center; gap: 10px;
  padding: 12px 14px; background: #fff; border: 1px solid #eef2f7;
  border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04);
}
.pills__num {
  width: 30px; height: 30px; border-radius: 999px; display: grid; place-items: center;
  background: rgba(89,195,214,0.28); color: #21c8e5; border: 2px solid #21c8e5; font-weight: 800;
}
.pills__icon { font-size: 18px; }
.pills__label { font-weight: 700; color: #0f172a; }
.pills__item[data-state="current"] { outline: 2px solid rgba(59,130,246,.18); }
.pills__item[data-state="done"] .pills__label { color: #1f2937; }

/* Controls card */
.wizard-card {
  max-width: 820px; margin: 12px auto 20px; padding: 16px 18px;
  border: 1px solid #e5e7eb; border-radius: 14px; background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 10px 24px rgba(0,0,0,.06);
}

/* Results */
.results h2 { font-size: 20px; margin: 18px 0 12px; }
.skeleton, .empty {
  color: #64748b; padding: 14px; border: 1px dashed #cbd5e1; border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

/* Section headers with colored dots */
.band { margin-top: 20px; }
.band__head { display: flex; align-items: center; gap: 8px; margin: 8px 0 10px; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }

/* Endangered image card grid */
.grid-cards {
  display: grid;
  gap: 14px;
  margin-top: 8px;
  grid-template-columns: repeat(4, 1fr);
}
@media (max-width: 1280px) { .grid-cards { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px)  { .grid-cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .grid-cards { grid-template-columns: 1fr; } }

/* Alerts */
.alert.error {
  background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
  padding: 10px 12px; border-radius: 10px; margin: 10px 0 14px;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;      
  gap: 12px;
  margin-top: 18px;
}

.pager-info {
  font-size: 14px;
  color: #64748b;
}

.pager .btn {
  min-width: 90px;
  height: 34px;
  border: none;    
  border-radius: 10px;
  background: #fff !important;
  color: #0f172a !important;   
  font-weight: 600;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease,
              color .18s ease, border-color .18s ease, background-color .18s ease;
}

.pager .btn:hover {
  background-color: #36ade1 !important;  
  color: #fff !important;
  border-color: #36ade1 !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(54, 173, 225, 0.35);
}

.pager .btn:active {
  background-color: #36ade1 !important;
  color: #fff !important;
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 6px rgba(54, 173, 225, 0.4);
}

.pager .btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
</style>