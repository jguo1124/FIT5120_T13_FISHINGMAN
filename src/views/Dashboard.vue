<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { api } from '@/lib/api'

// ---- state ----
const loadingBase = ref(false)
const loadingRegs = ref(false)
const errorMsg = ref('')

const zones = ref([])          // [{ id, code, name }]
const species = ref([])        // [{ id, code, common_name, ... }]
const regs = ref([])           // unified list [{ type, ... }]

const selectedZoneId = ref('')
const selectedSpeciesId = ref('')
const queryDate = ref(new Date().toISOString().slice(0, 10)) // 'YYYY-MM-DD'

// ---- computed ----
const filteredZones = computed(() => zones.value)
const filteredSpecies = computed(() => species.value)

const isReadyToQuery = computed(() => {
  return selectedZoneId.value && selectedSpeciesId.value
})

// ---- lifecycle ----
onMounted(async () => {
  await loadBaseData()
  // (Optional) auto-select first item for convenience
  if (zones.value.length && species.value.length) {
    selectedZoneId.value = String(zones.value[0].id)
    selectedSpeciesId.value = String(species.value[0].id)
    await loadRegulations()
  }
})

// ---- actions ----
async function loadBaseData() {
  loadingBase.value = true
  errorMsg.value = ''
  try {
    const [zRes, sRes] = await Promise.all([
      api.get('/zones'),
      api.get('/species'),
    ])
    zones.value = zRes.data ?? []
    species.value = sRes.data ?? []
  } catch (e) {
    errorMsg.value = e?.message || 'Failed to load base data'
  } finally {
    loadingBase.value = false
  }
}

async function loadRegulations() {
  if (!isReadyToQuery.value) return
  loadingRegs.value = true
  errorMsg.value = ''
  regs.value = []
  try {
    const { data } = await api.get('/regulations', {
      params: {
        zoneId: Number(selectedZoneId.value),
        speciesId: Number(selectedSpeciesId.value),
        at: queryDate.value, // 'YYYY-MM-DD'
      },
    })
    // Expecting unified array like:
    // [{ type: 'size', ... }, { type: 'quota', ... }, { type: 'season', ... }]
    regs.value = Array.isArray(data) ? data : []
  } catch (e) {
    errorMsg.value = e?.message || 'Failed to load regulations'
  } finally {
    loadingRegs.value = false
  }
}

// auto refresh when selections change
watch([selectedZoneId, selectedSpeciesId, queryDate], () => {
  if (isReadyToQuery.value) loadRegulations()
})

// ---- helpers ----
function fmtDate(dt) {
  if (!dt) return '—'
  // Accept both 'YYYY-MM-DD' and ISO strings
  const d = typeof dt === 'string' ? new Date(dt) : dt
  if (Number.isNaN(d.getTime())) return String(dt)
  return d.toISOString().slice(0, 10)
}

function labelOfReg(r) {
  if (r.type === 'size') return 'Size Limit'
  if (r.type === 'quota') return 'Quota'
  if (r.type === 'season') return 'Season Closure'
  return r.type || 'Unknown'
}
</script>

<template>
  <section class="dashboard">
    <header class="dash-header">
      <h1>Regulations Dashboard</h1>
      <p class="subtitle">
        View fishing rules by Zone & Species. Know the rules. Respect the waters.
      </p>
    </header>

    <div v-if="errorMsg" class="alert error">
      {{ errorMsg }}
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="control">
        <label>Zone</label>
        <select
          v-model="selectedZoneId"
          :disabled="loadingBase"
          class="input"
        >
          <option value="" disabled>Select a zone</option>
          <option
            v-for="z in filteredZones"
            :key="z.id"
            :value="String(z.id)"
          >
            {{ z.code }} — {{ z.name }}
          </option>
        </select>
      </div>

      <div class="control">
        <label>Species</label>
        <select
          v-model="selectedSpeciesId"
          :disabled="loadingBase"
          class="input"
        >
          <option value="" disabled>Select a species</option>
          <option
            v-for="s in filteredSpecies"
            :key="s.id"
            :value="String(s.id)"
          >
            {{ s.code }} — {{ s.common_name }}
          </option>
        </select>
      </div>

      <div class="control">
        <label>Date</label>
        <input
          type="date"
          class="input"
          v-model="queryDate"
          :max="new Date().toISOString().slice(0,10)"
        />
      </div>

      <div class="control">
        <label>&nbsp;</label>
        <button
          class="btn"
          :disabled="!isReadyToQuery || loadingRegs || loadingBase"
          @click="loadRegulations"
        >
          {{ loadingRegs ? 'Loading…' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div class="results">
      <h2>Active Regulations</h2>

      <div v-if="loadingRegs" class="skeleton">Loading regulations…</div>
      <div v-else-if="!regs.length" class="empty">
        No regulations found for the selected filters.
      </div>

      <ul v-else class="reg-list">
        <li v-for="r in regs" :key="`${r.type}-${r.id}`" class="reg-card">
          <div class="reg-head">
            <span class="pill">{{ labelOfReg(r) }}</span>
            <span class="effect">
              effective: {{ fmtDate(r.effective_from) }} → {{ r.effective_to ? fmtDate(r.effective_to) : 'open' }}
            </span>
          </div>

          <!-- Size limits -->
          <div v-if="r.type === 'size'" class="reg-body grid">
            <div><strong>Min (cm):</strong> {{ r.min_cm ?? '—' }}</div>
            <div><strong>Max (cm):</strong> {{ r.max_cm ?? '—' }}</div>
          </div>

          <!-- Quotas -->
          <div v-else-if="r.type === 'quota'" class="reg-body grid">
            <div><strong>Daily limit:</strong> {{ r.daily_limit ?? '—' }}</div>
            <div><strong>Seasonal limit:</strong> {{ r.seasonal_limit ?? '—' }}</div>
          </div>

          <!-- Seasons -->
          <div v-else-if="r.type === 'season'" class="reg-body grid">
            <div><strong>Closed from:</strong> {{ fmtDate(r.closed_from) }}</div>
            <div><strong>Closed to:</strong> {{ fmtDate(r.closed_to) }}</div>
          </div>

          <!-- Fallback -->
          <div v-else class="reg-body">
            <em>Unsupported rule type payload.</em>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

.dash-header h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px;
}
.subtitle {
  color: #64748b;
  margin: 0 0 20px;
}

.alert.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 16px;
}

.controls {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
}
.control label {
  display: block;
  font-size: 12px;
  color: #475569;
  margin-bottom: 6px;
}
.input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  outline: none;
}
.input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96,165,250,.2);
}

.btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results h2 {
  font-size: 20px;
  margin: 18px 0 10px;
}

.skeleton, .empty {
  color: #64748b;
  padding: 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
}

.reg-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}
.reg-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: white;
}
.reg-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
  flex-wrap: wrap;
}
.pill {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfd2ff;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 999px;
  font-weight: 700;
}
.effect {
  color: #64748b;
  font-size: 12px;
}
.reg-body.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 8px 12px;
}
</style>