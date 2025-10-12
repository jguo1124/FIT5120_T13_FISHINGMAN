<template>
  <!-- Toggle Button -->
  <button
    v-show="!open" 
    class="dock-toggle"
    :aria-expanded="open.toString()"
    aria-controls="floating-dock"
    @click="toggle"
    @keydown.esc="close"
    title="Open weather panel"
  >
    <span v-if="!open" class="toggle-content">
      <!-- Inline icon computed from currentDesc -->
      <Icon :icon="iconName" class="icon" />
      <span class="temp-text">{{ currentTemp != null ? currentTemp + '°C' : '' }}</span>
    </span>
    <span v-else>×</span>
  </button>

  <!-- Sliding Panel -->
  <aside
    id="floating-dock"
    class="dock"
    :class="{ open }"
    role="complementary"
    aria-label="Tools panel"
    @keydown.esc="close"
    ref="dockRef"
  >
    <header class="dock-header">
      <strong>{{ title }}</strong>
      <button class="close" @click="close" aria-label="Close panel">×</button>
    </header>

    <div class="dock-body">
      <!-- Listen BOTH patterns: update-temp(temp, desc) OR update:temp / update:desc -->
      <WeatherCard
        title="Local Weather"
        fallbackLabel="Melbourne"
        @update-temp="onUpdateTempLegacy"
        @update:temp="(t) => currentTemp = t"
        @update:desc="(d) => currentDesc = d"
      />
    </div>
  </aside>

  <!-- Mobile overlay backdrop -->
  <div v-if="open" class="backdrop" @click="close" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import WeatherCard from '@/components/WeatherCard.vue'

/** Props */
const props = defineProps<{ title?: string }>()
const title = props.title ?? 'Tools'

/** UI state */
const open = ref(false)
const dockRef = ref<HTMLElement | null>(null)

/** Weather data received from WeatherCard */
const currentTemp = ref<number | null>(null)
const currentDesc = ref<string>('')

/** Toggle handlers */
function toggle(){ open.value = !open.value }
function close(){ open.value = false }

/** Persist panel state (optional) */
onMounted(() => {
  const saved = localStorage.getItem('floatingDockOpen')
  if (saved === '1') open.value = true
})
watch(open, v => localStorage.setItem('floatingDockOpen', v ? '1' : '0'))

/** Legacy bridge for WeatherCard emit('update-temp', temp, desc) */
function onUpdateTempLegacy(temp: number | null, desc?: string) {
  currentTemp.value = temp
  if (typeof desc === 'string') currentDesc.value = desc
}

/** Compute icon name from currentDesc */
const iconName = computed(() => {
  const d = (currentDesc.value || '').toLowerCase()
  // Map common keywords to neutral weather icons
  if (d.includes('storm') || d.includes('thunder')) return 'mdi:weather-lightning'
  if (d.includes('rain') || d.includes('drizzle'))  return 'mdi:weather-rainy'
  if (d.includes('snow') || d.includes('sleet'))    return 'mdi:weather-snowy'
  if (d.includes('cloud'))                          return 'mdi:weather-cloudy'
  if (d.includes('clear') || d.includes('sun'))     return 'mdi:weather-sunny'
  return 'mdi:weather-partly-cloudy' // fallback (neutral)
})
</script>

<style scoped>
/* Toggle button */
.dock-toggle{
  position: fixed;
  right: 12px; top: 40%;
  z-index: 1100;
  min-width: 84px; height: 44px;
  padding: 0 12px;
  border-radius: 22px;
  border: 1px solid rgba(0,0,0,.12);
  background: #fff;
  box-shadow: 0 6px 16px rgba(0,0,0,.16);
  font-size: 15px; font-weight: 600; cursor: pointer;

  display: inline-flex; align-items: center; justify-content: center;
}
.toggle-content{ display: inline-flex; align-items: center; gap: 6px; }
.icon{ width: 20px; height: 20px; color: #475569; }
.temp-text{ color: #111827; }

/* Sliding dock */
.dock{
  position: fixed;
  right: 12px; top: 12%;
  top: calc(40% - 22px); 
  width: 340px; max-height: 76vh;
  transform: translateX(calc(100% + 12px));
  transform-origin: right center;
  transition: transform .24s ease;
  z-index: 1101;
  background: #fff; border: 1px solid #e6e6e6; border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0,0,0,.22);
  display: flex; flex-direction: column; overflow: hidden;
}
.dock.open{ transform: translateX(0); }

.dock-header{
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border-bottom: 1px solid #efefef; background: #f9fafb;
}
.dock-header .close{
  border: 0; background: transparent; font-size: 22px; cursor: pointer;
}

.dock-body{ padding: 12px; overflow: auto; }

/* Mobile behavior */
@media (max-width: 768px){
  .dock-toggle{ bottom: 14px; top: auto; }
  .dock{
    right: 0; left: 0; margin: 0 auto; bottom: 0; top: auto;
    width: 100%; max-height: 80vh; border-radius: 14px 14px 0 0;
    transform: translateY(100%);
  }
  .dock.open{ transform: translateY(0); }
  .backdrop{
    position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1100;
  }
}

@media (prefers-reduced-motion: reduce){
  .dock{ transition: none; }
}
</style>