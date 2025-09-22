<template>
  <aside class="weather-box" role="status" aria-live="polite" aria-busy="true">
    <header class="weather-header">
      <strong>{{ title }}</strong>
      <small v-if="locationLabel">· {{ locationLabel }}</small>
    </header>

    <!-- Loading state -->
    <div v-if="state === 'loading'" class="weather-row">
      <div class="skeleton title"></div>
      <div class="skeleton line"></div>
      <div class="skeleton line"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="state === 'error'" class="weather-error">
      <p>⚠️ {{ errorMessage }}</p>
      <button class="retry" @click="reload">Retry</button>
    </div>

    <!-- Success state -->
    <div v-else class="weather-content">
      <div class="weather-main">
        <div class="temp">{{ round(currentTemp) }}°C</div>
        <div class="cond">
          <span>{{ currentDesc }}</span>
          <span v-if="hi != null && lo != null" class="hl">
            H: {{ round(hi) }}° / L: {{ round(lo) }}°
          </span>
        </div>
      </div>

      <div class="kpis">
        <div>
          <span class="kpi">{{ Math.round(wind ?? 0) }}</span>
          <span class="label">km/h</span>
        </div>
        <div>
          <span class="kpi">{{ Math.round(pop * 100) }}%</span>
          <span class="label">Rain</span>
        </div>
        <div>
          <span class="kpi">{{ uvi ?? 0 }}</span>
          <span class="label">UVI</span>
        </div>
      </div>

      <div class="weather-meta">
        <span v-if="tz">🕒 {{ localTime }}</span>
      </div>

      <!-- Risk pill with English explanation -->
      <div class="risk" :data-level="riskLevel" :title="riskReason || riskText">
        <span class="dot"></span>
        <span class="risk-text">{{ riskText }}</span>
        <small v-if="riskReason" class="why">({{ riskReason }})</small>
      </div>

      <div class="weather-actions">
        <button class="refresh" @click="reload" :disabled="state !== 'success'">Refresh</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useUserStore } from "@/stores/user";

/**
 * Component props with sensible defaults.
 * - Pass initialLat/initialLon to pin a default location (e.g., Melbourne CBD).
 * - Set useGeolocation=true to try browser geolocation first.
 */
const props = withDefaults(defineProps<{
  title?: string
  initialLat?: number
  initialLon?: number
  fallbackLabel?: string
  lang?: string
  units?: "metric" | "imperial"
  exclude?: string
  useGeolocation?: boolean
}>(), {
  title: "Local Weather",
  fallbackLabel: "Melbourne",
  lang: "en",
  units: "metric",
  exclude: "minutely,alerts",
  useGeolocation: true,
});

const userStore = useUserStore();
const API_BASE = (import.meta.env?.VITE_API_BASE ?? "/api/v1").replace(/\/+$/, "");

/** View-state machine */
type WeatherState = "idle" | "loading" | "error" | "success";
const state = ref<WeatherState>("idle");
const errorMessage = ref("");

/** Weather fields */
const currentTemp = ref<number | null>(null);
const currentDesc = ref<string>("");
const wind = ref<number | null>(null); // km/h
const pop = ref<number>(0);            // 0..1 (probability of precipitation)
const uvi = ref<number | null>(null);
const hi = ref<number | null>(null);
const lo = ref<number | null>(null);
const tz = ref<string>("");

/** Risk indicator */
const riskLevel = ref<"safe" | "caution" | "not">("safe");
const riskText = ref<string>("Safe");
/** Human-readable explanation, e.g. "High chance of rain (79%)" */
const riskReason = ref<string>("");

const locationLabel = ref<string>("");

/** Helpers */
const round = (n: number | null) => (n == null ? 0 : Math.round(n));

/** Format local time using the API timezone */
const localTime = computed(() => {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz.value || "Australia/Melbourne",
    }).format(new Date());
  } catch {
    return "";
  }
});

/**
 * Call your backend proxy (/api/v1/weather/onecall).
 * Read text first (easier debugging), then parse JSON when content-type is correct.
 */
async function fetchOneCall(lat: number, lon: number) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const url = `${API_BASE}/weather/onecall?lat=${lat}&lon=${lon}&units=${props.units}&lang=${props.lang}&exclude=${props.exclude}`;
    const headers = new Headers({ 'Cache-Control': 'no-cache', Accept: 'application/json' });
    if (userStore.authToken) {
      headers.set('Authorization', `Bearer ${userStore.authToken}`);
    }
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: 'no-store',
      headers,
    });
    const textBody = await res.text();
    if (!res.ok) {
      try {
        const j = JSON.parse(textBody);
        throw new Error(j?.error?.message || `HTTP ${res.status}`);
      } catch {
        throw new Error(textBody.slice(0, 160));
      }
    }
    return JSON.parse(textBody);
  } finally {
    clearTimeout(timer);
  }
}

function computeLevelKmH(wkmh: number | null, p: number) {
  if (wkmh != null && wkmh > 30) {
    return {
      level: "not" as const,
      text: "Not recommended",
      reason: `Strong winds (${Math.round(wkmh)} km/h)`,
    };
  }
  if (p >= 0.6) {
    return {
      level: "caution" as const,
      text: "Caution",
      reason: `High chance of rain (${Math.round(p * 100)}%)`,
    };
  }
  return {
    level: "safe" as const,
    text: "Safe",
    reason: "",
  };
}

function sanitizeCoordinate(value: number | undefined, min: number, max: number, label: string) {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(num) || num < min || num > max) {
    throw new Error(`Invalid ${label}`);
  }
  return Number(num.toFixed(4));
}

/**
 * Load and map weather data.
 * Coordinate source priority: props → geolocation → fallback label.
 */
async function loadWeather(lat?: number, lon?: number) {
  if (!userStore.authToken) {
    state.value = "error";
    errorMessage.value = "Login required to load weather data.";
    return;
  }

  state.value = "loading";
  errorMessage.value = "";

  try {
    let usedLat = lat ?? props.initialLat;
    let usedLon = lon ?? props.initialLon;

    if (usedLat != null && usedLon != null) {
      locationLabel.value = props.fallbackLabel;
    } else if (props.useGeolocation && "geolocation" in navigator) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            usedLat = pos.coords.latitude;
            usedLon = pos.coords.longitude;
            locationLabel.value = "Your location";
            resolve();
          },
          () => {
            locationLabel.value = props.fallbackLabel;
            resolve();
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );
      });
    } else {
      locationLabel.value = props.fallbackLabel;
    }

    const safeLat = sanitizeCoordinate(usedLat, -90, 90, "latitude");
    const safeLon = sanitizeCoordinate(usedLon, -180, 180, "longitude");

    const oc = await fetchOneCall(safeLat, safeLon);

    const cur = oc?.current || {};
    const d0 = Array.isArray(oc?.daily) ? oc.daily[0] : null;

    currentTemp.value = typeof cur.temp === "number" ? cur.temp : null;
    currentDesc.value =
      (Array.isArray(cur.weather) && cur.weather[0]?.description) ||
      (Array.isArray(cur.weather) && cur.weather[0]?.main) || "??";

    const windMs = typeof cur.wind_speed === "number" ? cur.wind_speed : null;
    wind.value = windMs == null ? null : windMs * 3.6;

    pop.value = typeof d0?.pop === "number" ? d0.pop : 0;
    uvi.value = typeof cur.uvi === "number" ? Math.round(cur.uvi) : null;

    hi.value = typeof d0?.temp?.max === "number" ? d0.temp.max : null;
    lo.value = typeof d0?.temp?.min === "number" ? d0.temp.min : null;

    tz.value = oc?.timezone || "Australia/Melbourne";

    const lvl = computeLevelKmH(wind.value, pop.value);
    riskLevel.value = lvl.level;
    riskText.value = lvl.text;
    riskReason.value = lvl.reason;

    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    const message = String(e?.message || e || "");
    if (message && (message.toLowerCase().includes("unauthorized") || message.includes("401"))) {
      errorMessage.value = "Session expired. Please log in again.";
      userStore.logout();
    } else {
      errorMessage.value = message || "Failed to load weather";
    }
  }
}

/** Manual reload */
function reload() {
  loadWeather(props.initialLat, props.initialLon);
}

watch(
  () => userStore.authToken,
  (token) => {
    if (token) {
      loadWeather(props.initialLat, props.initialLon);
    } else {
      state.value = "error";
      errorMessage.value = "Login required to load weather data.";
    }
  },
  { immediate: true }
);

watch(
  () => [props.initialLat, props.initialLon],
  ([la, lo]) => {
    if (userStore.authToken && la != null && lo != null) {
      loadWeather(la, lo);
    }
  }
);
</script>

<style scoped>
/* Container */
.weather-box {
  background: #ffffffea;
  backdrop-filter: blur(4px);
  border: 1px solid #e7eefc;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  max-width: 480px;
}

/* Header */
.weather-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #334155;
}

/* Loading skeletons */
.skeleton {
  background: linear-gradient(90deg, #eee, #f6f6f6, #eee);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 6px;
}
.skeleton.title { width: 60%; height: 18px; margin-bottom: 8px; }
.skeleton.line  { width: 90%; height: 12px; margin-bottom: 6px; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Content */
.weather-content { display: grid; gap: 8px; }

.weather-main { display: flex; align-items: baseline; gap: 10px; }
.temp { font-size: 28px; font-weight: 700; }
.cond { display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: #475569; }
.hl { opacity: 0.8; }

/* KPIs */
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.kpi { font-weight: 700; font-size: 16px; display: block; }
.label { font-size: 12px; color: #666; }

/* Meta row */
.weather-meta { display: flex; gap: 12px; font-size: 13px; color: #64748b; }

/* Risk pill */
.risk {
  display: inline-flex; align-items: center; gap: 8px;
  font-weight: 600; border-radius: 10px; padding: 6px 10px; border: 1px solid transparent;
}
.risk .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.risk[data-level="safe"]    { color: #1a7f37; background: #e8f5ec; border-color: #cfe9d9; }
.risk[data-level="caution"] { color: #b8860b; background: #fff7e6; border-color: #ffe8b3; }
.risk[data-level="not"]     { color: #b42318; background: #ffecec; border-color: #ffd2d2; }
.risk-text { font-size: 14px; }
.why { font-size: 12px; color: #6b7280; }

/* Buttons */
.weather-actions { display: flex; justify-content: flex-end; }
.retry, .refresh {
  appearance: none;
  border: 1px solid #cbd5e1;
  background: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}
.refresh:disabled { opacity: 0.6; cursor: not-allowed; }

/* Error block */
.weather-error {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; font-size: 14px; color: #b91c1c;
}
</style>
