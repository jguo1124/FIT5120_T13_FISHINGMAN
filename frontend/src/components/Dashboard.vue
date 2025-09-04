<script setup>
import { ref, onMounted } from "vue";
import { fetchZoneRules, fetchSpeciesList } from "@/lib/api";

// Zones (static). If you later expose /zones in backend, fetch here instead.
const ZONES = [
  { code: "VIC-BAY", name: "Victoria Bay" },
  { code: "VIC-OFF", name: "Victoria Offshore" }
];

const zone = ref(ZONES[0].code);
const onDate = ref(new Date().toISOString().slice(0, 10)); // 'YYYY-MM-DD'
const loading = ref(false);
const errorMsg = ref("");

// API data
// When species is selected -> single object; otherwise -> array
const species = ref("");               // selected species code (optional)
const speciesOptions = ref([]);        // [{ code, common_name }]
const resultOne = ref(null);           // single-species result object
const resultList = ref([]);            // all-species result array
const zoneRestrictions = ref([]);      // optional: can be shown with both modes
const meta = ref(null);

// utils
function fmtDate(dt) {
  if (!dt) return "—";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  if (Number.isNaN(d.getTime())) return String(dt);
  return d.toISOString().slice(0, 10);
}

async function loadSpeciesList() {
  try {
    speciesOptions.value = await fetchSpeciesList(); // [{ code, common_name }]
  } catch (e) {
    // 不阻塞主流程，给到轻提示
    console.warn("Failed to load species list:", e);
  }
}

async function load() {
  loading.value = true;
  errorMsg.value = "";
  resultOne.value = null;
  resultList.value = [];
  zoneRestrictions.value = [];
  meta.value = null;

  try {
    // 调用新版 API：选了 species -> 单物种；否则 -> 全部
    const data = await fetchZoneRules({
      zoneCode: zone.value,
      onDate: onDate.value,
      species: species.value || undefined,
    });

    if (species.value) {
      // 单物种：后端返回对象 { species, zone, rule, seasons, zone_restrictions? }
      resultOne.value = data;
      zoneRestrictions.value = data?.zone_restrictions ?? [];
    } else {
      // 全部物种：后端返回数组 [ { species, zone, rule, seasons, zone_restrictions } ... ]
      resultList.value = Array.isArray(data) ? data : [];
      // 取任意一项的 zone_restrictions（同一个 zone 相同）
      zoneRestrictions.value = resultList.value[0]?.zone_restrictions ?? [];
    }
  } catch (e) {
    errorMsg.value = e?.message || "Failed to load regulations";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadSpeciesList();
  await load();
});
</script>

<template>
  <section class="dashboard">
    <header class="dash-header">
      <h1>Regulations Dashboard</h1>
      <p class="subtitle">Select your zone and (optionally) a species to view rules.</p>
    </header>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <div class="controls">
      <div class="control">
        <label>Zone</label>
        <select v-model="zone" class="input" :disabled="loading">
          <option v-for="z in ZONES" :key="z.code" :value="z.code">
            {{ z.code }} — {{ z.name }}
          </option>
        </select>
      </div>

      <div class="control">
        <label>Date</label>
        <input type="date" class="input" v-model="onDate" :disabled="loading" />
      </div>

      <div class="control">
        <label>Species (optional)</label>
        <select v-model="species" class="input" :disabled="loading || !speciesOptions.length">
          <option value="">All species</option>
          <option v-for="s in speciesOptions" :key="s.code" :value="s.code">
            {{ s.common_name || s.code }} ({{ s.code }})
          </option>
        </select>
      </div>

      <div class="control">
        <label>&nbsp;</label>
        <button class="btn" :disabled="loading" @click="load">{{ loading ? "Loading…" : "Refresh" }}</button>
      </div>
    </div>

    <div class="results">
      <h2>Active Regulations</h2>

      <div v-if="loading" class="skeleton">Loading regulations…</div>

      <!-- Zone restrictions (show when available) -->
      <div v-if="!loading && zoneRestrictions?.length" class="reg-card" style="margin-bottom:12px;">
        <div class="reg-head">
          <strong>Zone Restrictions</strong>
          <span class="zone-at">Zone: <b>{{ zone }}</b> · Date: {{ onDate }}</span>
        </div>
        <ul style="margin:6px 0 0 16px;">
          <li v-for="(zr, i) in zoneRestrictions" :key="(zr.code || 'zr') + i">
            <div><span class="tag tag-red">Restriction</span> <b>{{ zr.title }}</b></div>
            <div class="muted">{{ zr.details }}</div>
            <div class="muted">Effective: {{ zr.effective_from || '—' }} → {{ zr.effective_to || 'open' }}</div>
            <div v-if="zr.references?.length" class="muted">
              Refs:
              <a v-for="(u, j) in zr.references" :key="j" :href="u" target="_blank" rel="noreferrer">{{ u }}</a>
            </div>
          </li>
        </ul>
      </div>

      <!-- Single-species view -->
      <div v-if="!loading && species && resultOne" class="reg-card">
        <div class="reg-head">
          <div class="title">
            <span class="pill">{{ resultOne.species?.code?.toUpperCase() || "SPECIES" }}</span>
            <strong>{{ resultOne.species?.common_name }}</strong>
          </div>
          <div class="zone-at">Zone: <b>{{ resultOne.zone?.code || zone }}</b> · Date: {{ onDate }}</div>
        </div>

        <!-- Size -->
        <div class="block">
          <div class="block-head"><span class="tag tag-blue">Size Limit</span></div>
          <div class="block-body">
            <template v-if="!resultOne.rule">
              No rule found
            </template>
            <template v-else>
              Min: {{ resultOne.rule.min_cm ?? "—" }} cm ·
              Max: {{ resultOne.rule.max_cm ?? "No limit" }}
            </template>
          </div>
        </div>

        <!-- Quota -->
        <div class="block">
          <div class="block-head"><span class="tag tag-green">Quota</span></div>
          <div class="block-body">
            <template v-if="!resultOne.rule">
              —
            </template>
            <template v-else>
              Daily: {{ resultOne.rule.daily_bag_limit ?? "—" }} ·
              Seasonal: {{ resultOne.rule.seasonal_limit ?? "—" }}
              <span v-if="resultOne.rule.season_window">
                · Period: {{ resultOne.rule.season_window.start }} → {{ resultOne.rule.season_window.end }}
              </span>
            </template>
          </div>
        </div>

        <!-- Closed seasons -->
        <div class="block">
          <div class="block-head"><span class="tag tag-red">Season</span></div>
          <div class="block-body">
            <div class="muted" style="margin-top:6px;">
              <template v-if="resultOne.seasons?.length">
                Closed ranges:
                <ul style="margin:6px 0 0 16px;">
                  <li v-for="r in resultOne.seasons" :key="`${r.from}-${r.to}`">
                    {{ fmtDate(r.from) }} → {{ fmtDate(r.to) }}
                  </li>
                </ul>
              </template>
              <template v-else>No closed ranges</template>
            </div>
          </div>
        </div>
      </div>

      <!-- All-species view -->
      <div v-else-if="!loading && !species && resultList.length">
        <ul class="reg-list">
          <li v-for="sr in resultList" :key="sr.species?.code" class="reg-card">
            <div class="reg-head">
              <div class="title">
                <span class="pill">{{ sr.species?.code?.toUpperCase() || "SPECIES" }}</span>
                <strong>{{ sr.species?.common_name }}</strong>
              </div>
              <div class="zone-at">Zone: <b>{{ sr.zone?.code || zone }}</b> · Date: {{ onDate }}</div>
            </div>

            <!-- Size -->
            <div class="block">
              <div class="block-head"><span class="tag tag-blue">Size Limit</span></div>
              <div class="block-body">
                <template v-if="!sr.rule">
                  No rule found
                </template>
                <template v-else>
                  Min: {{ sr.rule.min_cm ?? "—" }} cm ·
                  Max: {{ sr.rule.max_cm ?? "No limit" }}
                </template>
              </div>
            </div>

            <!-- Quota -->
            <div class="block">
              <div class="block-head"><span class="tag tag-green">Quota</span></div>
              <div class="block-body">
                <template v-if="!sr.rule">
                  —
                </template>
                <template v-else>
                  Daily: {{ sr.rule.daily_bag_limit ?? "—" }} ·
                  Seasonal: {{ sr.rule.seasonal_limit ?? "—" }}
                  <span v-if="sr.rule.season_window">
                    · Period: {{ sr.rule.season_window.start }} → {{ sr.rule.season_window.end }}
                  </span>
                </template>
              </div>
            </div>

            <!-- Closed seasons -->
            <div class="block">
              <div class="block-head"><span class="tag tag-red">Season</span></div>
              <div class="block-body">
                <div class="muted" style="margin-top:6px;">
                  <template v-if="sr.seasons?.length">
                    Closed ranges:
                    <ul style="margin:6px 0 0 16px;">
                      <li v-for="r in sr.seasons" :key="`${r.from}-${r.to}`">
                        {{ fmtDate(r.from) }} → {{ fmtDate(r.to) }}
                      </li>
                    </ul>
                  </template>
                  <template v-else>No closed ranges</template>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div v-else-if="!loading" class="empty">
        No regulations found for {{ zone }} on {{ onDate || "today" }}.
      </div>

      <div v-if="meta" class="meta">
        version: v{{ meta.version_id }} · updated: {{ meta.updated_at }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard { max-width: 1080px; margin: 0 auto; padding: 24px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
.dash-header h1 { font-size: 28px; font-weight: 800; margin: 0 0 6px; }
.subtitle { color: #64748b; margin: 0 0 20px; }
.alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 10px 12px; border-radius: 10px; margin-bottom: 16px; }

.controls { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; align-items: end; margin-bottom: 18px; }
.control label { display: block; font-size: 12px; color: #475569; margin-bottom: 6px; }
.input { width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 10px; outline: none; }
.input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.2); }
.btn { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #2563eb; background: #2563eb; color: white; font-weight: 600; cursor: pointer; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.results h2 { font-size: 20px; margin: 18px 0 10px; }
.skeleton, .empty { color: #64748b; padding: 12px; border: 1px dashed #cbd5e1; border-radius: 10px; }
.reg-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }

.reg-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: white; }
.reg-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.title { display: flex; align-items: center; gap: 8px; }
.pill { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfd2ff; padding: 4px 8px; font-size: 12px; border-radius: 999px; font-weight: 700; }
.zone-at { color: #64748b; font-size: 12px; }

.block { border-top: 1px dashed #e5e7eb; padding-top: 10px; margin-top: 10px; }
.block-head { margin-bottom: 6px; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
.tag-blue { background: #eff6ff; color: #1d4ed8; border-color: #bfd2ff; }
.tag-green { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.tag-red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
.muted { color: #64748b; font-size: 13px; }

.meta { margin-top: 12px; color: #64748b; font-size: 12px; }
</style>
