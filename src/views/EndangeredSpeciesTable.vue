<template>
  <div class="page">
    <EsToolbar
      class="es-toolbar"
      :zone="zone" :q="q" :radius-km="radiusKm"
      @apply="applyFilters"
    >
      <template #pager>
        <EsPager :page="page" :total-pages="totalPages" @prev="prevPage" @next="nextPage" />
      </template>
    </EsToolbar>
  
    <div class="grid">
      <EsSpeciesCard v-for="sp in items" :key="sp.species_code" :sp="sp" />
      <EsEmptyState v-if="!loading && items.length===0" />
     
    </div>


  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useSpeciesList } from "@/Composables/useSpeciesList";
import EsToolbar from "@/components/es/EsToolbar.vue";
import EsPager from "@/components/es/EsPager.vue";
import EsSpeciesCard from "@/components/es/EsSpeciesCard.vue";
import EsEmptyState from "@/components/es/EsEmptyState.vue";

const {
  zone, q, radiusKm, page, totalPages, items, loading,
  fetchList, applyFilters, prevPage, nextPage
} = useSpeciesList();

onMounted(fetchList);
</script>

<style scoped>
.page { padding: 16px; background: #f7fafc; min-height: 100vh; color: #0f172a; }
.grid {
  display: grid; gap: 14px; margin-top: 14px;
  grid-template-columns: repeat(5, 1fr);
}
@media (max-width: 1280px) { .grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 980px)  { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 720px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .grid { grid-template-columns: 1fr; } }

:deep(.es-toolbar .control) { min-width: 0; }
:deep(.es-toolbar .control label) {
  display: block; font-size: 12px; color: #475569; margin-bottom: 6px;
}

:deep(.es-toolbar .input),
:deep(.es-toolbar input),
:deep(.es-toolbar select) {
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 10px;
  outline: none;
  transition: border-color .15s ease, box-shadow .18s ease, background-color .18s ease, transform .06s ease;
  -webkit-appearance: none;
  appearance: none;
}
:deep(.es-toolbar .input:hover),
:deep(.es-toolbar input:hover),
:deep(.es-toolbar select:hover) { border-color: rgba(148,163,184,.7); }
:deep(.es-toolbar .input:focus),
:deep(.es-toolbar input:focus),
:deep(.es-toolbar select:focus) {
  border-color: rgba(13,155,181,1);
  box-shadow: 0 0 0 4px rgba(37,99,235,.18);
  transform: scale(1.03);
  outline: none;
}
:deep(.es-toolbar .btn) {
  height: 36px; border-radius: 8px;
  border: 1px solid rgba(0,0,0,.22);
  background: #fff; color: #000; font-weight: 700; letter-spacing: .01em;
  transition: background-color .18s ease, box-shadow .2s ease, transform .06s ease, filter .18s ease, color .15s ease, border-color .15s ease, text-decoration-color .15s ease;
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
  cursor: pointer;
}
:deep(.es-toolbar .btn:hover:not(:disabled)) {
  color: rgba(13,155,181,1);
  text-decoration: underline;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(13,155,181,.35);
  border-color: rgba(13,155,181,1);
}
:deep(.es-toolbar .btn:active:not(:disabled)) { transform: scale(0.98); box-shadow: 0 2px 8px rgba(13,155,181,.25); }
:deep(.es-toolbar .btn:disabled) { opacity: .5; cursor: not-allowed; box-shadow: none; }
</style>
