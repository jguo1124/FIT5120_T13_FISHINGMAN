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

    <!-- unified outer panel -->
    <div class="kh-panel">
      <!-- controls row -->
      <div class="kh-wrap">
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

       <select v-if="allTags.length" v-model="tag" class="sel" aria-label="Filter by tag">
        <option v-for="t in allTags" :key="t" :value="t">{{ t }}</option>
      </select>

        <span class="label">Order:</span>
        <select v-model="sort" class="sel" aria-label="Sort">
          <option value="date_desc">Newest → Oldest</option>
          <option value="date_asc">Oldest → Newest</option>
        </select>

        <span class="label">Rows/page:</span>
        <select v-model.number="pageSize" class="sel" aria-label="Items per page">
          <option :value="8">8</option>
          <option :value="12">12</option>
          <option :value="16">16</option>
        </select>
      </div>

      <div class="kh-divider" aria-hidden="true"></div>

      <!-- list -->
      <div class="kh-list kh-table-grid">
        <div class="kc-row kc-head">
          <div class="col title">{{ tabLabel }}</div>
          <div class="col date">Date</div>
          <div class="col source">Source</div>
        </div>
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
import KnowledgeCard from '@/components/knowledgeCard/KnowledgeCards.vue'
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
const useMock = false
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
  display: flex;
  align-items: flex-start;
  gap: 3px;               
  flex-wrap: wrap;         
  box-sizing: border-box;
}

.kh-search {
  flex: 1;                  
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  padding: 0 12px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.sel {
  box-sizing: border-box; 
  height: 30px;
  line-height: 25px;  
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  outline: none;
}
.sel:focus{
  border-color: var(--blue);
  box-shadow: 0 0 0 2px rgba(54,173,225,.2);
}
.kh-search:focus-within{
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(54, 173, 225, .25); 
}
.kh-search input{ border:none; outline:none; font-size:14px; width:100%; color:var(--text); }
.kh-search input:focus{
  outline: none;
}

.kh-divider{ grid-column:1 / -1; height:1px; background:var(--border); margin-top:10px; }

/* table grid (1:1:2) + force same width as ruler */
.kh-table-grid{
  grid-column:1 / -1;
  display:grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, .8fr) minmax(0, 1.2fr);
  column-gap: 450px;
}

/* ===== centralize KnowledgeCard row styles via :deep() ===== */
:deep(.kc-row){
  grid-column:1 / -1;              /* span full width of table grid */
  display:grid;
  grid-template-columns: 1.5fr 0.3fr 0.8fr;
  column-gap: 48px;
  align-items:center;
  padding:10px 0;                  /* no left/right padding for hard edge alignment */
  border-bottom:1px solid var(--border);
  background:transparent;
  box-shadow:none; border-radius:0;
  padding-left: 8px;
  padding-right: 8px;
}
:deep(.kc-title){
  margin:0; font-size:16px; font-weight:500; color:var(--text);
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

.kh-panel .kh-pager .pbtn{
  position: relative;
  border: 1px solid var(--border);
  background-color: #fff !important;
  background-image: none !important;         
  color: var(--text) !important;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  min-width: 90px;
  font-weight: 600;
  transition: transform .18s ease, box-shadow .18s ease, color .18s ease, border-color .18s ease, background-color .18s ease;
  -webkit-tap-highlight-color: transparent;
}

.kh-panel .kh-pager .pbtn:not(:disabled):hover{
  background-color: #36ade1 !important;  
  background-image: none !important;     
  color: #fff !important;              
  border-color: var(--blue) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(54, 173, 225, 0.35);
}

.kh-panel .kh-pager .pbtn:not(:disabled):active{
  background-color: var(--blue) !important;
  background-image: none !important;
  color: #fff !important;
  border-color: var(--blue) !important;
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 6px rgba(54, 173, 225, 0.4);
}

.kh-panel .kh-pager .pbtn:disabled{
  opacity: .45;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
.ppage{ font-size:14px; color:#64748b }

/* unified outer panel */
.kh-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 18px 20px 24px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;        
  box-sizing: border-box;
}

.kh-list { 
  overflow: hidden; 
}

.kc-head {
  font-weight: 700;       
  font-size: 15px;    
  color: #1f2937;         
  letter-spacing: 0.5px;  
  background: transparent; 
}
.label {
  font-size: 14px;
  color: var(--muted);
  margin-left: 6px;
  margin-right: 3px;
  align-self: center;
}
</style>