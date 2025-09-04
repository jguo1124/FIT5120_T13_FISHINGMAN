<template>
  <div class="page">
    <EsToolbar
      class="es-toolbar"
      :zone="zone" :q="q" :radius-km="radiusKm"
      @apply="applyFilters"
    >
      <!-- removed EsPager slot, replaced by custom slider below -->
      <!--
      <template #pager>
        <EsPager :page="page" :total-pages="totalPages" @prev="prevPage" @next="nextPage" />
      </template>
      -->
    </EsToolbar>

    <!-- slider container -->
    <div
      class="slider"
      tabindex="0"
      @keydown.left.prevent="handlePrev"
      @keydown.right.prevent="handleNext"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- animated grid of species cards -->
      <transition :name="slideDir" mode="out-in">
        <div class="grid" :key="itemsKey">
          <EsSpeciesCard v-for="sp in items" :key="sp.species_code" :sp="sp" />
          <EsEmptyState v-if="!loading && items.length===0" />
        </div>
      </transition>

      <!-- navigation arrows -->
      <button v-if="totalPages>1" class="nav nav-left"  @click="handlePrev" aria-label="Previous page">‹</button>
      <button v-if="totalPages>1" class="nav nav-right" @click="handleNext" aria-label="Next page">›</button>
    </div>

    <!-- page indicator dots -->
    <div class="dots" v-if="totalPages>1">
      <button
        v-for="i in totalPages"
        :key="'dot-'+i"
        class="dot"
        :class="{ active: i-1 === page }"
        @click="goTo(i-1)"
        :aria-label="`Go to page ${i}`"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useSpeciesList } from "@/Composables/useSpeciesList";
import EsToolbar from "@/components/es/EsToolbar.vue";
// import EsPager from "@/components/es/EsPager.vue";
import EsSpeciesCard from "@/components/es/EsSpeciesCard.vue";
import EsEmptyState from "@/components/es/EsEmptyState.vue";

const {
  zone, q, radiusKm, page, totalPages, items, loading,
  fetchList, applyFilters, prevPage, nextPage
} = useSpeciesList();

/* slider state */
const itemsKey = ref(0);       // for triggering <transition> re-render
const slideDir = ref("slide-left"); // 'slide-left' / 'slide-right'
let touchX = 0, dx = 0, touching = false;

function handlePrev() {
  slideDir.value = "slide-right"; 
  prevPage();                    
  itemsKey.value++;              
}
function handleNext() {
  slideDir.value = "slide-left";  
  nextPage();                     
  itemsKey.value++;
}

// direct jump to a specific page (via dots)
function goTo(targetIndex) {
  if (targetIndex === page.value) return;
  slideDir.value = targetIndex > page.value ? "slide-left" : "slide-right";
  const steps = Math.abs(targetIndex - page.value);
  const move = targetIndex > page.value ? nextPage : prevPage;
  for (let i = 0; i < steps; i++) move();
  itemsKey.value++;
}

function onTouchStart(e) {
  if (totalPages.value <= 1) return;
  touching = true;
  touchX = e.touches[0].clientX;
  dx = 0;
}
function onTouchMove(e) {
  if (!touching) return;
  dx = e.touches[0].clientX - touchX;
}
function onTouchEnd() {
  if (!touching) return;
  touching = false;
  const threshold = 60;
  if (dx > threshold) handlePrev();
  else if (dx < -threshold) handleNext();
  dx = 0;
}

/* initial fetch */
onMounted(fetchList);

/* refresh itemsKey when items change */
watch(items, () => { itemsKey.value++; });
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

/* slider container */
.slider {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  outline: none;
}

/* slide animations */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active { transition: transform .28s ease, opacity .28s ease; }

.slide-left-enter-from  { transform: translateX(100%); opacity: .01; }
.slide-left-leave-to    { transform: translateX(-20%); opacity: 0; }

.slide-right-enter-from { transform: translateX(-100%); opacity: .01; }
.slide-right-leave-to   { transform: translateX(20%);  opacity: 0; }

/* navigation arrows */
.nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid rgba(0,0,0,.12); background: #fff; color: #0f172a;
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; user-select: none;
}
.nav-left  { left: 8px; }
.nav-right { right: 8px; }
.nav:hover { color: rgba(13,155,181,1); border-color: rgba(13,155,181,1); }

/* page indicator dots */
.dots { display: flex; gap: 8px; justify-content: center; margin-top: 10px; }
.dot { width: 8px; height: 8px; border-radius: 999px; background: #cbd5e1; border: none; cursor: pointer; }
.dot.active { background: rgba(13,155,181,1); }

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