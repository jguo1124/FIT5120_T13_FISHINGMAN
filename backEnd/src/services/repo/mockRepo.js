import { MOCK, SPECIES_META, REG_VERSION } from "../../Data/MockData.js";

const parse = (d) => new Date(d + "T00:00:00Z");

export async function getSpeciesByCode(code) {
  return SPECIES_META[code] || null;
}

export async function getZoneByCode(zoneCode) {

  return { code: zoneCode };
}

export async function getRuleSnapshot(code, zoneCode, onDateStr) {
  const byZone = MOCK[code]?.[zoneCode];
  if (!byZone) return null;

  const todayStr = onDateStr || new Date().toISOString().slice(0,10);
  const today = parse(todayStr);

  const closedRanges = (byZone.seasons || []).map(r => ({ from: r.from, to: r.to }));
  const inClosed = closedRanges.some(r => today >= parse(r.from) && today <= parse(r.to));
  const nextClosed = closedRanges.find(r => parse(r.from) > today) || null;

  const sz = byZone.size_limits || {};
  const sizeOut = (sz.min_cm != null || sz.max_cm != null)
    ? { min_cm: sz.min_cm ?? null, max_cm: sz.max_cm ?? null }
    : { min_cm: null, max_cm: null, message: "No size limit available" };

  const qt = byZone.quotas || {};
  const hasQuota = (qt.daily_limit != null || qt.seasonal_limit != null);
  const quotaOut = hasQuota
    ? {
        daily_limit: qt.daily_limit ?? null,
        seasonal_limit: qt.seasonal_limit ?? null,
        season_window: (qt.season_window?.start && qt.season_window?.end)
          ? { start: qt.season_window.start, end: qt.season_window.end }
          : null
      }
    : { daily_limit: null, seasonal_limit: null, message: "No quota restrictions" };

  return {
    size_limits: sizeOut,
    quotas: quotaOut,
    season: {
      status: inClosed ? "CLOSED" : "OPEN",
      ui_badge: inClosed ? "Closed Season" : "Open season",
      closed_ranges: closedRanges,
      next_closed_range: nextClosed ? { from: nextClosed.from, to: nextClosed.to } : null
    },
    meta: { version_id: REG_VERSION, updated_at: new Date().toISOString() }
  };
}
export async function getCurrentVersionId() {
  return REG_VERSION;
}

