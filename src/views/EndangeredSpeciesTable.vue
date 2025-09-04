<template>
  <div class="page">
    <!-- Toolbar with filters -->
    <EsToolbar
      class="es-toolbar"
      :zone="zone"
      :q="q"
      :radius-km="radiusKm"
      @apply="onApply"
    />

    <!-- Slider area -->
    <div
      class="slider"
      tabindex="0"
      @keydown.left.prevent="handlePrev"
      @keydown.right.prevent="handleNext"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Transition wrapper -->
      <transition :name="slideDir" mode="out-in">
        <div class="grid" :key="itemsKey">
          <!-- Species cards -->
          <EsSpeciesCard v-for="sp in itemsSafe" :key="sp.species_code" :sp="sp" />

          <!-- Empty state: only show if there are no species at all -->
          <div
            v-if="!loading && itemsSafe.length === 0 && totalPages.value === 0"
            class="empty muted"
            style="text-align:center; padding:12px;"
          >
            No species found. Try another keyword or adjust filters.
          </div>
        </div>
      </transition>

      <!-- Left arrow -->
      <button
        v-if="tp > 1"
        class="nav nav-left"
        @click="handlePrev"
        :disabled="isPaging || loading || page <= 0"
        aria-label="Previous page"
      >‹</button>

      <!-- Right arrow -->
      <button
        v-if="tp > 1"
        class="nav nav-right"
        @click="handleNext"
        :disabled="isPaging || loading || page >= tp - 1"
        aria-label="Next page"
      >›</button>
    </div>

    <!-- Dots -->
    <div class="dots" v-if="tp > 1">
      <button
        v-for="i in tp"
        :key="'dot-' + i"
        class="dot"
        :class="{ active: (i - 1) === page }"
        @click="goTo(i - 1)"
        :disabled="isPaging || loading"
        :aria-label="`Go to page ${i}`"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * Slider-based species list
 * - Uses useSpeciesList() for zone, q, radius, pagination and data.
 * - Replaces traditional pager with slider UI (arrows + dots).
 * - Shows empty state only when no species at all.
 */
import { ref, computed, onMounted } from "vue";
import { useSpeciesList } from "@/Composables/useSpeciesList";
import EsToolbar from "@/components/es/EsToolbar.vue";
import EsSpeciesCard from "@/components/es/EsSpeciesCard.vue";

/* From composable */
const {
  zone, q, radiusKm, page, totalPages, items, loading,
  fetchList, applyFilters,
} = useSpeciesList();

/* Safe wrapper for items */
const itemsSafe = computed(() => Array.isArray(items.value) ? items.value : []);

/* Local UI state */
const itemsKey = ref(0);              // trigger re-render for transition
const slideDir = ref("slide-left");   // slide direction
const isPaging = ref(false);          // prevent concurrent paging
const tp = computed(() => Math.max(0, Number(totalPages.value) || 0)); // total pages (number)

/* Page navigation */
async function loadPage(targetIndex) {
  if (isPaging.value) return;
  if (tp.value <= 0) return;

  // clamp
  const clamped = Math.min(Math.max(targetIndex, 0), tp.value - 1);

  slideDir.value = clamped > page.value ? "slide-left" : "slide-right";

  isPaging.value = true;
  try {
    page.value = clamped;
    await fetchList();
    itemsKey.value++;
  } finally {
    isPaging.value = false;
  }
}

function handlePrev() { loadPage(page.value - 1); }
function handleNext() { loadPage(page.value + 1); }
function goTo(idx0)   { loadPage(idx0); }

/* Touch swipe */
let touchX = 0, dx = 0, touching = false;
function onTouchStart(e) {
  if (tp.value <= 1) return;
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

/* Apply filters: reset to first page */
async function onApply() {
  slideDir.value = "slide-left";
  isPaging.value = true;
  try {
    page.value = 0;
    await applyFilters();
    await fetchList();
    itemsKey.value++;
  } finally {
    isPaging.value = false;
  }
}

/* Initial load */
onMounted(async () => {
  await fetchList();
  itemsKey.value++;
});
</script>

<style scoped>
.page { padding: 16px; background: #f7fafc; min-height: 100vh; color: #0f172a; }

/* Card grid */
.grid {
  display: grid; gap: 14px; margin-top: 14px;
  grid-template-columns: repeat(5, 1fr);
}
@media (max-width: 1280px) { .grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 980px)  { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 720px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .grid { grid-template-columns: 1fr; } }

/* Slider container */
.slider {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  outline: none;
}

/* Slide animations */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active { transition: transform .28s ease, opacity .28s ease; }

.slide-left-enter-from  { transform: translateX(100%); opacity: .01; }
.slide-left-leave-to    { transform: translateX(-20%); opacity: 0; }

.slide-right-enter-from { transform: translateX(-100%); opacity: .01; }
.slide-right-leave-to   { transform: translateX(20%);  opacity: 0; }

/* Arrow buttons */
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
.nav:disabled { opacity: .4; cursor: not-allowed; }

/* Dots */
.dots { display: flex; gap: 8px; justify-content: center; margin-top: 10px; }
.dot { width: 8px; height: 8px; border-radius: 999px; background: #cbd5e1; border: none; cursor: pointer; }
.dot.active { background: rgba(13,155,181,1); }
</style>