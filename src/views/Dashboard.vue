<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { fetchZoneRules } from "@/lib/api";

// Zones (static). If you later expose /zones in backend, fetch here instead.
const ZONES = [
  { code: "VIC-BAY", name: "Victoria Bay" },
  { code: "VIC-OFF", name: "Victoria Offshore" }
];

const zone = ref(ZONES[0].code);
const onDate = ref(new Date().toISOString().slice(0, 10)); // 'YYYY-MM-DD'
const loading = ref(false);
const errorMsg = ref("");
const result = ref(null);

// Optional species filter (frontend only)
const speciesFilter = ref("");
const speciesOptions = computed(() => {
  const list = result.value?.species_rules ?? [];
  const map = new Map();
  for (const sr of list) {
    const code = sr.species?.code;
    const name = sr.species?.common_name || code;
    if (code && !map.has(code)) map.set(code, name);
  }
  return Array.from(map, ([code, name]) => ({ code, name }));
});
const displayRules = computed(() => {
  const list = result.value?.species_rules ?? [];
  if (!speciesFilter.value) return list;
  return list.filter((sr) => sr.species?.code === speciesFilter.value);
});
watch([zone, onDate], () => (speciesFilter.value = ""));

function fmtDate(dt) {
  if (!dt) return "-";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  if (Number.isNaN(d.getTime())) return String(dt);
  return d.toISOString().slice(0, 10);
}

async function load() {
  loading.value = true;
  errorMsg.value = "";
  try {
    result.value = await fetchZoneRules(zone.value, onDate.value);
  } catch (e) {
    errorMsg.value = e?.message || "Failed to load regulations";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="dashboard">
    <header class="dash-header">
      <h1>Regulations Dashboard</h1>
      <p class="subtitle">Select your zone and see all rules for that zone.</p>
    </header>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <div class="controls">
      <div class="control">
        <label>Zone</label>
        <select v-model="zone" class="input" :disabled="loading">
          <option v-for="z in ZONES" :key="z.code" :value="z.code">
            {{ z.code }} - {{ z.name }}
          </option>
        </select>
      </div>

      <div class="control">
        <label>Date</label>
        <input type="date" class="input" v-model="onDate" :disabled="loading" />
      </div>

      <div class="control">
        <label>Species (optional)</label>
        <select v-model="speciesFilter" class="input" :disabled="loading || !speciesOptions.length">
          <option value="">All species</option>
          <option v-for="s in speciesOptions" :key="s.code" :value="s.code">
            {{ s.code }} - {{ s.name }}
          </option>
        </select>
      </div>

      <div class="control">
        <label>&nbsp;</label>
        <button class="btn" :disabled="loading" @click="load">{{ loading ? "Loading..." : "Refresh" }}</button>
      </div>
    </div>

    <div class="results">
      <h2>Active Regulations</h2>

      <div v-if="loading" class="skeleton">Loading regulations...</div>

      <div v-else-if="!result?.species_rules?.length" class="empty">
        No regulations found for {{ zone }} on {{ onDate || "today" }}.
      </div>

      <!-- Zone restrictions -->
      <div v-if="result?.zone_restrictions?.length" class="reg-card" style="margin-bottom:12px;">
        <div class="reg-head">
          <strong>Zone Restrictions</strong>
          <span class="zone-at">Zone: <b>{{ result.zone }}</b> · Date: {{ result.at }}</span>
        </div>
        <ul style="margin:6px 0 0 16px;">
          <li v-for="zr in result.zone_restrictions" :key="zr.code + (zr.effective_from||'')">
            <div><span class="tag tag-red">Restriction</span> <b>{{ zr.title }}</b></div>
            <div class="muted">{{ zr.details }}</div>
            <div class="muted">Effective: {{ zr.effective_from || '-' }} to {{ zr.effective_to || 'open' }}</div>
            <div v-if="zr.references?.length" class="muted">
              Refs:
              <a v-for="(u,i) in zr.references" :key="i" :href="u" target="_blank" rel="noreferrer">{{ u }}</a>
            </div>
          </li>
        </ul>
      </div>

      <!-- Species rules -->
      <ul v-if="result?.species_rules?.length" class="reg-list">
        <li v-for="sr in displayRules" :key="sr.species?.code" class="reg-card">
          <div class="reg-head">
            <div class="title">
              <span class="pill">{{ sr.species?.code?.toUpperCase() || "SPECIES" }}</span>
              <strong>{{ sr.species?.common_name }}</strong>
            </div>
            <div class="zone-at">Zone: <b>{{ sr.zone }}</b> · Date: {{ result.at }}</div>
          </div>

          <!-- Size -->
          <div class="block">
            <div class="block-head"><span class="tag tag-blue">Size Limit</span></div>
            <div class="block-body">
              <template v-if="sr.size_limits?.message">{{ sr.size_limits.message }}</template>
              <template v-else>
                Min: {{ sr.size_limits?.min_cm ?? "-" }} cm ·
                Max: {{ sr.size_limits?.max_cm ?? "No limit" }}
              </template>
            </div>
          </div>

          <!-- Quota -->
          <div class="block">
            <div class="block-head"><span class="tag tag-green">Quota</span></div>
            <div class="block-body">
              <template v-if="sr.quotas?.message">{{ sr.quotas.message }}</template>
              <template v-else>
                Daily: {{ sr.quotas?.daily_limit ?? "-" }} ·
                Seasonal: {{ sr.quotas?.seasonal_limit ?? "-" }}
                <span v-if="sr.quotas?.season_window">
                  · Period: {{ sr.quotas.season_window.start }} to {{ sr.quotas.season_window.end }}
                </span>
              </template>
            </div>
          </div>

          <!-- Season -->
          <div class="block">
            <div class="block-head"><span class="tag tag-red">Season</span></div>
            <div class="block-body">
              <strong>{{ sr.season?.ui_badge }}</strong>
              <div class="muted" style="margin-top:6px;">
                <template v-if="sr.season?.closed_ranges?.length">
                  Closed ranges:
                  <ul style="margin:6px 0 0 16px;">
                    <li v-for="r in sr.season.closed_ranges" :key="`${r.from}-${r.to}`">
                      {{ fmtDate(r.from) }} to {{ fmtDate(r.to) }}
                    </li>
                  </ul>
                </template>
                <template v-else>No closed ranges</template>
                <div v-if="sr.season?.next_closed_range" style="margin-top:4px;">
                  Next closed: {{ fmtDate(sr.season.next_closed_range.from) }} to
                  {{ fmtDate(sr.season.next_closed_range.to) }}
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="result?.meta" class="meta">
        version: v{{ result.meta.version_id }} · updated: {{ result.meta.updated_at }}
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ===== Base ===== */
.dashboard { max-width: 1080px; margin: 0 auto; padding: 24px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
.dash-header h1 { font-size: 28px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.01em; line-height: 1.25; }
.subtitle { color: #64748b; margin: 0 0 20px; line-height: 1.6; max-width: 68ch; }
.alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 10px 12px; border-radius: 10px; margin-bottom: 16px; }

.controls {
  display: grid;
  grid-template-columns: minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto;
  column-gap: 16px; row-gap: 12px;
  align-items: end;
  margin-bottom: 18px;
}
.control { min-width: 0; }
.control label { display: block; font-size: 12px; color: #475569; margin-bottom: 6px; }

/* uniform box sizing */
.controls input,
.controls select,
.controls .input,
.controls .btn { box-sizing: border-box; width: 100%; margin: 0; }

/* Inputs */
.input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 10px;
  height: 36px;
  outline: none;
  transition: border-color .15s ease, box-shadow .18s ease, background-color .18s ease, transform .06s ease;
}

.controls input,
.controls select {
  height: 36px;
  border-radius: 8px;
  padding: 0 10px;
  outline: none;
  transition: border-color .15s ease, box-shadow .18s ease, background-color .18s ease, transform .06s ease;
  -webkit-appearance: none;
  appearance: none;
}
.input:hover,
.controls input:hover,
.controls select:hover { border-color: rgba(148,163,184,.7); }
.input:focus,
.controls input:focus,
.controls select:focus {
  border-color: rgba(37,99,235,1);
  box-shadow: 0 0 0 4px rgba(37,99,235,.18);
  transform: translateY(-1px);
  outline: none;
}

/* Date picker tweaks + button cursor */
.controls input[type="date"] { color-scheme: light; }
.controls input[type="date"]::-webkit-datetime-edit,
.controls input[type="date"]::-webkit-datetime-edit-fields-wrapper,
.controls input[type="date"]::-webkit-datetime-edit-text,
.controls input[type="date"]::-webkit-datetime-edit-month-field,
.controls input[type="date"]::-webkit-datetime-edit-day-field,
.controls input[type="date"]::-webkit-datetime-edit-year-field { line-height: 1; }
.controls input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer; opacity: .7; transition: opacity .15s ease, filter .15s ease;
}
.controls input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1; filter: drop-shadow(0 0 2px rgba(37,99,235,.18));
}

/* Button */
.controls .control:last-child { margin-left: 8px; }
.btn {
  height: 36px; border-radius: 8px;
  border: 1.2px solid rgba(37,99,235,1);
  background: linear-gradient(180deg, rgba(37,99,235,.98) 0%, rgba(37,99,235,.92) 100%);
  color: #fff; font-weight: 700; letter-spacing: .01em;
  transition: background-color .18s ease, box-shadow .2s ease, transform .06s ease, filter .18s ease;
  box-shadow: 0 6px 16px rgba(37,99,235,.18);
  cursor: pointer;
}
.btn:hover:not(:disabled) { filter: brightness(.97); box-shadow: 0 8px 22px rgba(37,99,235,.22); }
.btn:active:not(:disabled) { transform: translateY(1px); box-shadow: 0 4px 12px rgba(37,99,235,.18); }
.btn:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(37,99,235,.18), 0 6px 16px rgba(37,99,235,.18); }
.btn:disabled { opacity: .55; cursor: not-allowed; filter: none; box-shadow: none; }

/* Results & cards (refined) */
.results h2 { font-size: 20px; margin: 18px 0 12px; }

.skeleton, .empty {
  color: #64748b;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.reg-list {
  list-style: none;
  padding: 0; margin: 0;
  display: grid;
  gap: 12px;
}

.reg-card {
  border: 1px solid #e5e9f2;                
  border-radius: 12px;
  padding: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%); 
  box-shadow:
    0 1px 2px rgba(15,23,42,.04),         
    0 6px 18px rgba(15,23,42,.06);    
  transition: transform .08s ease, box-shadow .18s ease, border-color .18s ease, background-color .18s ease;
  will-change: transform, box-shadow;
}
.reg-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 2px 6px rgba(15,23,42,.05),
    0 12px 28px rgba(15,23,42,.10);
  border-color: #dde3ee;
}
.reg-card:active {
  transform: translateY(-1px);
  box-shadow:
    0 1px 3px rgba(15,23,42,.05),
    0 8px 18px rgba(15,23,42,.08);
}

.reg-head {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
}
.title { display: flex; align-items: center; gap: 8px; }

.pill {
  background: #f3f7ff;                      
  color: #1d4ed8;
  border: 1px solid #c8d7ff;
  padding: 4px 8px;
  font-size: 12px; border-radius: 999px; font-weight: 700;
}
.zone-at { color: #64748b; font-size: 12px; }

.block {
  border-top: 1px solid #cbd5e1;           
  padding-top: 12px;
  margin-top: 12px;
}
.block-head { margin-bottom: 8px; }

.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
.tag-blue  { background: #f3f7ff; color: #1d4ed8; border-color: #c8d7ff; }
.tag-green { background: #eefdf6; color: #047857; border-color: #b7f3d6; }
.tag-red   { background: #fff5f5; color: #b91c1c; border-color: #ffd1d1; }

.muted { color: #5f6f85; font-size: 13px; }

.meta { margin-top: 12px; color: #64748b; font-size: 12px; }

/* focus visible */
.reg-card :focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37,99,235,.18);
  border-radius: 6px;
}

/* reduce motion */
@media (prefers-reduced-motion: reduce) {
  .reg-card { transition: none; }
  .reg-card:hover, .reg-card:active {
    transform: none;
    box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 6px 18px rgba(15,23,42,.06);
  }
}
</style>
