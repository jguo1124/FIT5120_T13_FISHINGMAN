
import repo from "./repo/index.js";  

export async function getRulesSnapshot(code, zoneCode, onDate) {
  const sp = await repo.getSpeciesByCode(code);
  const zone = await repo.getZoneByCode(zoneCode);
  if (!sp || !zone) return null;

  const snap = await repo.getRuleSnapshot(code, zoneCode, onDate);
  if (!snap) return null;

  return {
    species: { code: sp.code ?? code, common_name: sp.common_name ?? (sp.name || code) },
    zone: zone.code ?? zoneCode,
    ...snap
  };
}

export async function getCurrentVersionId() {

  return await repo.getCurrentVersionId();
}
