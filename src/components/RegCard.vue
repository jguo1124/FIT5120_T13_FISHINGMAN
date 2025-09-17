<!-- src/components/RegCard.vue -->
<script setup>
import { computed } from "vue";

/**
 * Props
 * - items: normalized rows [{ species, zone, rule, _source, ... }]
 * - zone: string
 * - onDate: string
 * - hideNoRestrictions: boolean
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  zone: { type: String, required: true },
  onDate: { type: String, required: true },
  loading: { type: Boolean, default: false },
  hideNoRestrictions: { type: Boolean, default: false },
});

/* helpers */
const toStr = (v) => (v == null ? "" : String(v).trim());
const isZero = (v) => toStr(v) === "0";
const isNoLimit = (v) => toStr(v).toLowerCase() === "no limit";
const isNilOrEmpty = (v) => toStr(v) === "";

function deriveFlags(nr) {
  const min = nr?.rule?.min_cm;
  const max = nr?.rule?.max_cm;
  const daily = nr?.rule?.daily_bag_limit;

  const noMin = isNilOrEmpty(min) || isZero(min);
  const noMax = isNilOrEmpty(max) || isNoLimit(max);
  const noSizeLimit = noMin && noMax;

  const noDailyLimit = isNilOrEmpty(daily) || isNoLimit(daily);
  const noTake = isZero(daily);

  // size-only mode: hide when no size limit (unless NO TAKE)
  const noAnyRestriction = noSizeLimit;

  return { noSizeLimit, noDailyLimit, noTake, noAnyRestriction };
}

function fmtSizeLabel(nr) {
  const f = deriveFlags(nr);
  if (f.noSizeLimit) return "No size limit";
  const min = toStr(nr?.rule?.min_cm);
  const max = toStr(nr?.rule?.max_cm);
  const minTxt = isNilOrEmpty(min) || isZero(min) ? "-" : `${min} cm`;
  const maxTxt = isNilOrEmpty(max) || isNoLimit(max) ? "No Limit" : `${max} cm`;
  return `Min: ${minTxt} · Max: ${maxTxt}`;
}

function fmtDailyLabel(nr) {
  const f = deriveFlags(nr);
  if (f.noTake) return "No take (bag limit 0)";
  if (f.noDailyLimit) return "No daily limit";
  return `Daily: ${nr?.rule?.daily_bag_limit ?? "-"}`;
}

/* filtering */
const list = computed(() => {
  if (!props.hideNoRestrictions) return props.items;
  return props.items.filter((nr) => {
    const f = deriveFlags(nr);
    if (f.noTake) return true;         // always show NO TAKE
    return !f.noAnyRestriction;        // hide only "no size limit"
  });
});
</script>

<template>
  <section class="cards">
    <article v-for="sr in list" :key="sr.species?.code" class="card">
      <header class="head">
        <div class="title">
          <span class="pill">{{ sr.species?.code?.toUpperCase() || "SPECIES" }}</span>
          <strong>{{ sr.species?.common_name }}</strong>
          <span
            v-if="sr._source"
            class="tag"
            :class="deriveFlags(sr).noTake ? 'tag-red' : (sr._source === 'spot' ? 'tag-green' : 'tag-blue')"
          >
            {{ deriveFlags(sr).noTake ? "NO TAKE" : (sr._source || '').toUpperCase() }}
          </span>
        </div>
        <div class="meta">
          Zone: <b>{{ sr.zone?.code || zone }}</b> · Date: {{ onDate }}
        </div>
      </header>

      <div class="block">
        <div class="block-head"><span class="tag tag-blue">Size Limit</span></div>
        <div class="block-body">{{ fmtSizeLabel(sr) }}</div>
      </div>

      <div class="block">
        <div class="block-head"><span class="tag tag-green">Quota</span></div>
        <div class="block-body">
          {{ fmtDailyLabel(sr) }}
          <span v-if="sr.rule?.seasonal_limit"> · Seasonal: {{ sr.rule.seasonal_limit }}</span>
          <span v-if="sr.rule?.season_window">
            · Period: {{ sr.rule.season_window.start }} to {{ sr.rule.season_window.end }}
          </span>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
/* Responsive card grid */
.cards{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

/* Card styling */
.card{
  border: 1px solid #e5e9f2;
  border-radius: 12px;
  padding: 14px;
  background: linear-gradient(180deg,#fff 0%,#fbfcff 100%);
  box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 6px 18px rgba(15,23,42,.06);
  transition: transform .08s ease, box-shadow .18s ease, border-color .18s ease, background-color .18s ease;
}
.card:hover{
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(15,23,42,.05), 0 12px 28px rgba(15,23,42,.10);
  border-color: #dde3ee;
}

/* Header */
.head{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  gap:10px;
  flex-wrap:wrap;
  margin-bottom:12px;
}
.title{ display:flex; align-items:center; gap:8px; }
.pill{
  background:#f3f7ff; color:#0d9bb5; border:1px solid #c8d7ff;
  padding:4px 8px; font-size:12px; border-radius:999px; font-weight:700;
}
.meta{ color:#64748b; font-size:12px; }

/* Blocks */
.block{ border-top:1px solid #cbd5e1; padding-top:12px; margin-top:12px; }
.tag{ display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; font-weight:700; border:1px solid transparent; }
.tag-blue  { background:#f3f7ff; color:#1d4ed8; border-color:#c8d7ff; }
.tag-green { background:#eefdf6; color:#047857; border-color:#b7f3d6; }
.tag-red   { background:#fff5f5; color:#b91c1c; border-color:#ffd1d1; }

/* Small screens: slightly smaller minimum card width */
@media (max-width: 380px){
  .cards{ grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
}
</style>