<template>
  <section class="px-4 py-6 max-w-5xl mx-auto">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Knowledge Hub</h1>
      <p class="text-gray-600">Guides · Tutorials · News</p>
    </header>

    <!-- Tabs -->
    <nav class="mb-4 flex gap-2">
      <button
        v-for="t in tabs"
        :key="t.val"
        class="px-4 py-2 rounded-full border"
        :class="tab === t.val ? 'bg-black text-white border-black' : 'hover:bg-gray-100'"
        @click="switchTab(t.val)"
      >
        {{ t.label }}
      </button>
    </nav>

    <!-- Controls -->
    <div class="mb-4 flex items-center gap-3">
      <label class="text-sm text-gray-600">Sort:</label>
      <select v-model="sort" class="border rounded-lg px-3 py-2 text-sm">
        <option value="date_desc">Newest → Oldest</option>
        <option value="date_asc">Oldest → Newest</option>
      </select>
      <span class="text-xs text-gray-500">Total: {{ total }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid gap-3 sm:grid-cols-2">
      <div v-for="n in 4" :key="n" class="h-28 rounded-2xl bg-gray-100 animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4 border rounded-xl bg-red-50 text-red-700">
      加载失败：{{ error }} <button class="underline ml-2" @click="reload">重试</button>
    </div>

    <!-- List -->
    <div v-else>
      <div v-if="items.length" class="grid gap-4 sm:grid-cols-2">
        <KnowledgeCard v-for="it in items" :key="it.id" :item="it" />
      </div>

      <!-- Empty state -->
      <div v-else class="p-6 text-center text-gray-500 border rounded-xl">
        {{ emptyMessage }}
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex items-center justify-between">
        <button
          class="px-3 py-2 rounded border disabled:opacity-40"
          :disabled="page <= 1"
          @click="page--"
        >
          ← Prev
        </button>
        <div class="text-sm text-gray-600">
          Page {{ page }} / {{ totalPages }}
        </div>
        <button
          class="px-3 py-2 rounded border disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="page++"
        >
          Next →
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import KnowledgeCard from "@/components/KnowledgeCard/KnowledgeCard.vue";
import { fetchKnowledge } from "@/lib/api.js";

const tabs = [
  { val: "guide", label: "Guides" },
  { val: "tutorial", label: "Tutorials" },
  { val: "news", label: "News" },
];

const tab = ref("guide");
const sort = ref("date_desc");
const page = ref(1);
const pageSize = ref(8);

const items = ref([]);
const total = ref(0);
const loading = ref(false);
const error = ref(null);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const emptyMessage = computed(() => {
  if (tab.value === "guide") return "No guides available. Please check back later.";
  if (tab.value === "tutorial") return "No tutorials available. Please check back later.";
  return "No news available right now.";
});

function switchTab(t) {
  if (tab.value !== t) {
    tab.value = t;
    page.value = 1;
  }
}

async function load() {
  loading.value = true;
  error.value = null;
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

function reload() {
  load();
}

watch([tab, sort, page], load, { immediate: true });
</script>
