<template>
  <section class="kh">
    <header class="kh-header">
      <h1>Knowledge Hub</h1>
      <p class="kh-sub">Guides · Tutorials · News</p>
    </header>

    <!-- Tabs -->
    <nav class="kh-tabs">
      <button
        v-for="t in tabs"
        :key="t.val"
        class="kh-tab"
        :class="{ active: tab === t.val }"
        @click="switchTab(t.val)"
      >
        {{ t.label }}
      </button>
    </nav>

    <!-- Controls -->
    <div class="kh-controls">
      <label>Sort:</label>
      <select v-model="sort" class="kh-select">
        <option value="date_desc">Newest → Oldest</option>
        <option value="date_asc">Oldest → Newest</option>
      </select>
      <span class="kh-total">Total: {{ total }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="kh-grid">
      <div v-for="n in 4" :key="n" class="kh-skeleton" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="kh-error">
      加载失败：{{ error }} <button class="kh-retry" @click="reload">重试</button>
    </div>

    <!-- List -->
    <div v-else>
      <div v-if="items.length" class="kh-grid">
        <KnowledgeCard v-for="it in items" :key="it.id" :item="it" />
      </div>

      <!-- Empty -->
      <div v-else class="kh-empty">
        {{ emptyMessage }}
      </div>

      <!-- Pagination -->
      <div class="kh-pager">
        <button class="kh-btn" :disabled="page <= 1" @click="page--">← Prev</button>
        <div class="kh-page">Page {{ page }} / {{ totalPages }}</div>
        <button class="kh-btn" :disabled="page >= totalPages" @click="page++">Next →</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import KnowledgeCard from '@/components/KnowledgeCard/KnowledgeCard.vue';
import { fetchKnowledge } from '@/lib/api.js';

const tabs = [
  { val: 'guide', label: 'Guides' },
  { val: 'tutorial', label: 'Tutorials' },
  { val: 'news', label: 'News' },
];

const tab = ref('news');
const sort = ref('date_desc');
const page = ref(1);
const pageSize = ref(8);

const items = ref([]);
const total = ref(0);
const loading = ref(false);
const error = ref(null);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const emptyMessage = computed(() => {
  if (tab.value === 'guide') return 'No guides available. Please check back later.';
  if (tab.value === 'tutorial') return 'No tutorials available. Please check back later.';
  return 'No news available right now.';
});

function switchTab(t) {
  if (tab.value !== t) { tab.value = t; page.value = 1; }
}

async function load() {
  loading.value = true; error.value = null;
  try {
    const data = await fetchKnowledge({
      category: tab.value,
      page: page.value,
      page_size: pageSize.value,
      sort: sort.value,
    });
    items.value = data.items;
    total.value = data.total;
  } catch (e) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

function reload(){ load(); }

watch([tab, sort, page], load, { immediate: true });
</script>

<style scoped>
:root{
  --kh-text:#1f2937;
  --kh-muted:#6b7280;
  --kh-border:#e5e7eb;
  --kh-bg:#ffffff;
  --kh-accent:#0d6efd;
  --kh-hover:#0b5ed7;
  --kh-shadow:0 2px 8px rgba(0,0,0,.06);
}

.kh{max-width:960px;margin:2.5rem auto;padding:0 1rem;color:var(--kh-text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial;}
.kh-header h1{font-size:2rem;margin:.25rem 0 0;}
.kh-sub{color:var(--kh-muted);margin:.25rem 0 1.25rem;}

/* Tabs */
.kh-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;}
.kh-tab{border:1px solid var(--kh-border);background:#fff;color:var(--kh-text);
  border-radius:999px;padding:.45rem 1rem;cursor:pointer;transition:.15s;}
.kh-tab:hover{background:#f8fafc}
.kh-tab.active{background:var(--kh-accent);border-color:var(--kh-accent);color:#fff}

/* Controls */
.kh-controls{display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap}
.kh-controls label{font-size:.9rem;color:var(--kh-muted)}
.kh-select{padding:.45rem .75rem;border:1px solid var(--kh-border);border-radius:.5rem;background:#fff}
.kh-total{font-size:.8rem;color:var(--kh-muted)}

/* Grid */
.kh-grid{display:grid;grid-template-columns:1fr;gap:1rem}
@media (min-width: 720px){ .kh-grid{grid-template-columns:1fr 1fr;} }

/* Empty / Error / Loading */
.kh-empty{border:1px dashed var(--kh-border);color:var(--kh-muted);text-align:center;border-radius:12px;padding:1.5rem}
.kh-error{border:1px solid #fecaca;background:#fff1f2;color:#b91c1c;padding:1rem;border-radius:12px}
.kh-retry{background:none;border:none;color:var(--kh-accent);cursor:pointer;text-decoration:underline}
.kh-retry:hover{color:var(--kh-hover)}
.kh-skeleton{height:110px;border-radius:16px;background:linear-gradient(90deg,#f3f4f6, #eef2f7, #f3f4f6);
  background-size:200% 100%;animation:kh-shimmer 1.1s linear infinite}
@keyframes kh-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Pagination */
.kh-pager{display:flex;align-items:center;justify-content:space-between;margin-top:1rem}
.kh-btn{border:1px solid var(--kh-border);background:#fff;padding:.5rem .9rem;border-radius:.5rem;cursor:pointer}
.kh-btn:disabled{opacity:.4;cursor:not-allowed}
.kh-btn:not(:disabled):hover{background:#f8fafc}
.kh-page{font-size:.9rem;color:var(--kh-muted)}
</style>
