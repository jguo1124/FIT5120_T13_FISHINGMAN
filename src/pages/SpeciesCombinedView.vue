<script setup>
import { ref, onMounted, watch, computed } from "vue";
import WizardControls from "@/components/WizardControls.vue";
import RegList from "@/components/RegCard.vue";
import EsSpeciesCard from "@/components/es/EsSpeciesCard.vue"; // ✅ image card for endangered species
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
    const resp = await fetch(`/api/v1/species_combined/${encodeURIComponent(zone.value)}`);
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
watch(zone, v => { step.value = v ? 2 : 1; });
watch(onDate, v => { if (zone.value && v) step.value = 3; });

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

// For RegCard (invasive / general groups)
const cardsInvasive = computed(() =>
  (groups.value?.invasive || []).map(sp => toRegCardItem(sp, zone.value, onDate.value))
);
const cardsGeneral = computed(() =>
  (groups.value?.general || []).map(sp => toRegCardItem(sp, zone.value, onDate.value))
);

// ✅ For EsSpeciesCard (endangered group with images)
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
        @update:zone="onZoneChanged"
        @update:onDate="onDateChanged"
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
            <h3>Endangered / No-take ({{ endangeredImageItems.length }})</h3>
          </div>
          <div class="grid-cards">
            <EsSpeciesCard
              v-for="sp in endangeredImageItems"
              :key="sp.species_code"
              :sp="sp"
            />
          </div>
          <div v-if="endangeredImageItems.length === 0" class="empty">No endangered species in this zone.</div>
        </section>

        <!-- 🟨 Invasive: RegCard -->
        <section class="band warning">
          <div class="band__head">
            <span class="dot yellow"></span>
            <h3>Invasive ({{ cardsInvasive.length }})</h3>
          </div>
        <RegList
            :items="cardsInvasive"
            :zone="zone"
            :onDate="onDate"
            :loading="loading"
            :hideNoRestrictions="false"
          />
        </section>

        <!-- 🟩 General: RegCard -->
        <section class="band neutral">
          <div class="band__head">
            <span class="dot green"></span>
            <h3>General ({{ cardsGeneral.length }})</h3>
          </div>
          <RegList
            :items="cardsGeneral"
            :zone="zone"
            :onDate="onDate"
            :loading="loading"
            :hideNoRestrictions="false"
          />
        </section>
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
</style>