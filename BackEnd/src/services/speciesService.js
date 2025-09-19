import repo from "./repo/index.js";

/**
 * Get a snapshot of rules for a single species in a specific zone.
 * Includes base rule + zone-wide restrictions.
 */
export async function getRulesSnapshot(code, zoneCode, onDate) {
  const sp = await repo.getSpeciesByCode(code);
  const zone = await repo.getZoneByCode(zoneCode);
  if (!sp || !zone) return null;

  const snap = await repo.getRuleSnapshot(code, zoneCode, onDate);
  if (!snap) return null;

  const restrictions = await repo.getZoneRestrictions(zoneCode, onDate);

  return {
    species: { code: sp.code ?? code, common_name: sp.common_name ?? sp.name ?? code },
    zone: zone.code ?? zoneCode,
    zone_restrictions: restrictions,
    ...snap
  };
}

/**
 * Get all rules for a zone.
 * Iterates through all species and adds zone-wide restrictions.
 */
export async function getZoneRules(zoneCode, onDate) {
  const codes = await repo.getAllSpeciesCodes();
  const list = [];
  for (const code of codes) {
    const s = await getRulesSnapshot(code, zoneCode, onDate);
    if (s) list.push(s);
  }
  const zoneRestrictions = await repo.getZoneRestrictions(zoneCode, onDate);
  return { zoneRestrictions, list };
}

/**
 * Get the latest regulation version ID (global).
 */
export async function getCurrentVersionId() {
  return await repo.getCurrentVersionId();
}
