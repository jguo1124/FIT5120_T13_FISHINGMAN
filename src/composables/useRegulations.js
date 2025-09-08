import { ref, computed } from "vue";
import { fetchZoneRules, fetchSpeciesList, fetchZones } from "@/lib/api";

// ---------- helpers ----------
const toStr = (v) => (v == null ? "" : String(v).trim());
const isNumeric = (x) => typeof x === "number" || (/^\d+(\.\d+)?$/.test(toStr(x)));
const isNoLimitWord = (v) => ["no limit", "unlimited", "不限", "-", ""].includes(toStr(v).toLowerCase());
const isZero = (v) => Number(toStr(v)) === 0;

function noSizeLimit(minCm, maxCm) {
  const noMin = !isNumeric(minCm) || isZero(minCm);
  const noMax = isNoLimitWord(maxCm);
  return noMin && noMax;
}
function isNoTake(daily) {
  const s = toStr(daily).toLowerCase();
  return isZero(s) || s === "no take" || s === "notake";
}
function noRestriction(minCm, maxCm, daily) {
  const sizeOk = noSizeLimit(minCm, maxCm);
  const dailyNoLimit = isNoLimitWord(daily) || toStr(daily) === "";
  return sizeOk && dailyNoLimit;
}


function normalizeRow(row, zoneCode) {
  return {
    species: { code: row.species, common_name: row.species },
    zone: { code: zoneCode || row.zone_code },
    rule: {
      min_cm: row.size_min_cm ?? null,
      max_cm: row.size_max_cm ?? null,
      daily_bag_limit: row.daily_limit ?? null,
      seasonal_limit: row.seasonal_limit ?? null,
      season_window:
        row.season_window_start || row.season_window_end
          ? { start: row.season_window_start || null, end: row.season_window_end || null }
          : null,
    },
    seasons: [],
    zone_restrictions: [],
    _source: row.source,
    _area: row.area,
  };
}

// ---------- core ----------
export function useRegulations() {
  // state
  const zones = ref([]);
  const zone = ref("");
  const onDate = ref(new Date().toLocaleDateString("en-CA"));
  const loading = ref(false);
  const errorMsg = ref("");

  const species = ref("");
  const speciesOptions = ref([]);

  const resultOne = ref(null);
  const resultList = ref([]);
  const hideNoRestrictions = ref(false);
  const meta = ref(null);

  const filteredResultList = computed(() => {
    if (!hideNoRestrictions.value) return resultList.value;
    return resultList.value.filter((r) => {
      const { min_cm, max_cm, daily_bag_limit } = r.rule || {};
      return !noRestriction(min_cm, max_cm, daily_bag_limit);
    });
  });

  async function loadZones() {
    try {
      const list = await fetchZones();
      zones.value = list;
      if (!zone.value && zones.value.length) zone.value = zones.value[0].code;
    } catch {
      zones.value = [{ code: "Lake Bullen Merri", area: "South-West / Shipwreck Coast" }];
      zone.value = zones.value[0].code;
    }
  }

  async function loadSpeciesList() {
    try {
      speciesOptions.value = await fetchSpeciesList();
    } catch {
      speciesOptions.value = [];
    }
  }

  async function load() {
    if (!zone.value) return;
    loading.value = true;
    errorMsg.value = "";

    const prevOne = resultOne.value;
    const prevList = resultList.value;

    resultOne.value = null;
    resultList.value = [];
    meta.value = null;

    try {
      const data = await fetchZoneRules({
        zoneCode: zone.value,
        onDate: onDate.value,
        species: species.value || undefined,
      });

      if (species.value) {
        resultOne.value = data ? normalizeRow(data, zone.value) : null;
      } else {
        const arr = Array.isArray(data) ? data : [];
        resultList.value = arr.map((r) => normalizeRow(r, zone.value));
      }
    } catch (e) {
      errorMsg.value = e?.message || "Failed to load regulations";
      resultOne.value = prevOne;
      resultList.value = prevList;
    } finally {
      loading.value = false;
    }
  }

  return {
    // state
    zones, zone, onDate, loading, errorMsg,
    species, speciesOptions,
    resultOne, resultList, filteredResultList,
    hideNoRestrictions, meta,

    // helpers 
    toStr, isNumeric, isNoLimitWord, isZero, noSizeLimit, isNoTake,

    // actions
    loadZones, loadSpeciesList, load,
  };
}
