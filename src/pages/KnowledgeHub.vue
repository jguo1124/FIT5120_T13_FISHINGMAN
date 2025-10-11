<template>
  <section class="kh">
    <!-- header -->
    <header class="kh-header">
      <h1 class="kh-title">Knowledge Hub</h1>
      <p class="kh-sub">News and fishing tutorials to keep you safe and compliant.</p>

      <!-- tabs -->
      <nav class="kh-tabs" role="tablist" aria-label="Sections">
        <button
          v-for="t in tabs"
          :key="t.val"
          type="button"
          class="kh-tab"
          :class="{ active: tab === t.val }"
          role="tab"
          :aria-selected="tab === t.val"
          @click="switchTab(t.val)"
        >
          {{ t.label }}
        </button>
      </nav>
    </header>

    <!-- width ruler + table -->
    <div class="kh-wrap">
      <!-- controls row (ruler) -->
      <div class="kh-search">
        <span class="ico">🔎</span>
        <input
          v-model.trim="q"
          type="search"
          placeholder="Search..."
          aria-label="Search"
          @keydown.enter.prevent
        />
      </div>

      <select v-model="tag" class="sel" aria-label="Filter by tag">
        <option value="">All tags</option>
        <option v-for="t in allTags" :key="t" :value="t">{{ t }}</option>
      </select>

      <select v-model="sort" class="sel" aria-label="Sort">
        <option value="date_desc">Newest → Oldest</option>
        <option value="date_asc">Oldest → Newest</option>
      </select>

      <select v-model.number="pageSize" class="sel" aria-label="Items per page">
        <option :value="8">8</option>
        <option :value="12">12</option>
        <option :value="16">16</option>
      </select>

      <div class="kh-divider" aria-hidden="true"></div>

      <!-- column headers -->
      <div class="kh-header-row kh-table-grid">
        <div>{{ tabLabel }}</div>
        <div>Date</div>
        <div>Source</div>
      </div>

      <!-- list -->
      <div class="kh-list kh-table-grid">
        <KnowledgeCard
          v-for="it in pagedItems"
          :key="it.id"
          :item="it"
          class="kh-row"
        />

        <div v-if="!loading && !error && !pagedItems.length" class="kh-empty">
          No items found.
        </div>
        <div v-if="error" class="kh-alert">Failed to load: {{ error }}</div>
        <div v-if="loading" class="kh-skel"></div>
      </div>

      <!-- pager -->
      <div class="kh-pager">
        <button class="pbtn" :disabled="page <= 1" @click="prevPage">Prev</button>
        <div class="ppage">Page {{ page }} / {{ totalPages }}</div>
        <button class="pbtn" :disabled="page >= totalPages" @click="nextPage">Next</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import KnowledgeCard from '@/components/KnowledgeCard/KnowledgeCard.vue'
import { fetchKnowledge } from '@/lib/api.js'

const tabs = [
  { val: 'news', label: 'News' },
  { val: 'tutorial', label: 'Fishing Tutorials' },
]

const tab = ref('news')
const q = ref('')
const tag = ref('')
const sort = ref('date_desc')
const page = ref(1)
const pageSize = ref(8)

const items = ref([])
const loading = ref(false)
const error = ref(null)

const tabLabel = computed(() => (tab.value === 'tutorial' ? 'Fishing Tutorial' : 'News'))

// mock data so UI is visible
const useMock = true
function genMock(kind, n = 20) {
  return Array.from({ length: n }).map((_, i) => ({
    id: `${kind}-${i + 1}`,
    title: kind === 'news' ? `Sample News Title ${i + 1}` : `Sample Fishing Tutorial ${i + 1}`,
    url: '#',
    source: kind === 'news' ? 'VFA' : 'Guides',
    tags: kind === 'news' ? ['policy', 'update'] : ['technique', 'safety'],
    published_at: new Date(Date.now() - i * 86400000).toISOString(),
  }))
}

async function load() {
  loading.value = true
  error.value = null
  try {
    if (useMock) {
      items.value = genMock(tab.value, 20)
    } else {
      const data = await fetchKnowledge({
        category: tab.value,
        page: 1,
        page_size: 200,
        sort: sort.value,
      })
      items.value = Array.isArray(data?.items) ? data.items : []
    }
  } catch (e) {
    error.value = e?.message ?? String(e)
    items.value = []
  } finally {
    loading.value = false
  }
}

const allTags = computed(() => {
  const s = new Set()
  for (const it of items.value) {
    const arr = Array.isArray(it.tags) ? it.tags : []
    arr.forEach(t => s.add(String(t)))
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b))
})

const filtered = computed(() => {
  const text = q.value.toLowerCase()
  return items.value.filter(it => {
    const hit = !text || String(it.title || '').toLowerCase().includes(text)
    const hasTag = !tag.value || (Array.isArray(it.tags) && it.tags.map(String).includes(tag.value))
    return hit && hasTag
  })
})

const sorted = computed(() => {
  const arr = [...filtered.value]
  const t = (it) => new Date(it.published_at || it.created_at || 0).getTime()
  if (sort.value === 'date_asc') arr.sort((a, b) => t(a) - t(b))
  else arr.sort((a, b) => t(b) - t(a))
  return arr
})

const total = computed(() => sorted.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sorted.value.slice(start, start + pageSize.value)
})

function switchTab(v) {
  if (tab.value !== v) {
    tab.value = v
    q.value = ''
    tag.value = ''
    page.value = 1
    load()
  }
}
function prevPage(){ if (page.value > 1) page.value-- }
function nextPage(){ if (page.value < totalPages.value) page.value++ }

watch([q, tag, pageSize, sort], () => { page.value = 1 })
onMounted(() => { document.title = 'GoFish - Knowledge Hub'; load() })
</script>

<style scoped>
:root{
  --text:#0f172a;
  --muted:#475569;
  --border:#e5e7eb;
  --bg:#ffffff;
  --blue:#36ade1;
}

/* page width 2/3 screen */
.kh{
  width: clamp(720px, 66.666vw, 980px);
  margin: 0 auto;
  padding: 24px 16px 56px;
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* header + tabs */
.kh-title{ margin:0 0 6px; font-size:28px; font-weight:800; letter-spacing:-.01em; }
.kh-sub{ margin:0 0 10px; color:var(--muted); }

.kh-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 10px 0 6px;
}

.kh-tab {
  appearance: none;
  background: #fff;
  border: 1px solid #d1d5db; 
  color: #111827; 
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.kh-tab:hover:not(.active) {
  background: #f9fafb;
}

.kh-tab.active {
  background: #36ade1 !important; 
  border-color: #36ade1!important; 
  color: #fff !important;
}

/* ruler: search | tag | sort | size */
.kh-wrap {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) max-content max-content max-content;
  column-gap: 24px;
  row-gap: 12px;
  align-items: center;
  box-sizing: border-box;
}

.kh-search{
  display:flex; align-items:center; gap:8px;
  height:38px; border:1px solid var(--border); border-radius:10px; background:#fff; padding:0 12px;
}
.kh-search input{ border:none; outline:none; font-size:14px; width:100%; color:var(--text); }
.sel{ height:38px; padding:8px 12px; border:1px solid var(--border); border-radius:10px; background:#fff; font-size:14px; }

.kh-divider{ grid-column:1 / -1; height:1px; background:var(--border); margin-top:6px; }

/* table grid (1:1:2) + force same width as ruler */
.kh-table-grid{
  grid-column:1 / -1;
  display:grid;
  grid-template-columns:1fr 1fr 2fr;  /* Title | Date | Source */
  column-gap:24px;
}

/* header row */
.kh-header-row{
  font-weight:700; font-size:14px; color:var(--muted);
  padding:12px 0; border-bottom:2px solid var(--border);
}

/* list + pager align with ruler exactly */
.kh-header-row, .kh-list, .kh-pager{
  grid-column:1 / -1; width:100%; margin-inline:0; padding-inline:0;
}

/* ===== centralize KnowledgeCard row styles via :deep() ===== */
:deep(.kc-row){
  grid-column:1 / -1;              /* span full width of table grid */
  display:grid;
  grid-template-columns:1fr 1fr 2fr;
  column-gap:24px;
  align-items:center;
  padding:10px 0;                  /* no left/right padding for hard edge alignment */
  border-bottom:1px solid var(--border);
  background:transparent;
  box-shadow:none; border-radius:0;
}
:deep(.kc-title){
  margin:0; font-size:16px; font-weight:700; color:var(--text);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
:deep(.kc-title a){ color:inherit; text-decoration:none; }
:deep(.kc-title a:hover){ text-decoration:underline; text-underline-offset:3px; }
:deep(.col.title){ text-align:left; min-width:0; }
:deep(.col.date){ color:var(--muted); font-size:14px; white-space:nowrap; }
:deep(.col.source){ color:var(--muted); font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* states */
.kh-empty{
  color:#64748b; padding:14px; border:1px dashed var(--border); border-radius:12px;
  background:linear-gradient(180deg,#fff 0%,#fbfcff 100%); margin-top:14px;
}
.kh-alert{
  margin-top:14px; padding:12px; border-radius:10px;
  background:#fee2e2; border:1px solid #fecaca; color:#991b1b;
}
.kh-skel{
  height:120px; border-radius:12px; margin-top:14px;
  background:linear-gradient(90deg,#F2F4F7,#EEF2F7,#F2F4F7);
  background-size:200% 100%; animation:kh-shimmer 1.1s linear infinite;
}
@keyframes kh-shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* pager */
.kh-pager{
  display:flex; align-items:center; justify-content:center; gap:12px; margin-top:18px;
}
.pbtn{
  border:1px solid var(--border); background:#fff; color:var(--text);
  padding:8px 14px; border-radius:10px; cursor:pointer; min-width:90px; font-weight:700;
}
.pbtn:not(:disabled):hover{ background:#f8fafc; }
.pbtn:disabled{ opacity:.45; cursor:not-allowed; }
.ppage{ font-size:14px; color:#64748b }


</style>