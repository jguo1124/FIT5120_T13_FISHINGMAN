import { getPool } from "../services/repo/mysqlPool.js";

function norm(x){ return String(x??"").trim().toLowerCase().replace(/\s+/g," "); }
const INVASIVE = new Set(["invasive"]);
const ENDANGERED = new Set([
  "critically endangered","endangered","threatened","vulnerable","near threatened","regionally extinct"
]);
const toKey = (s) => {
  const n = norm(s);
  if (INVASIVE.has(n)) return "invasive";
  if (ENDANGERED.has(n)) return "endangered";
  return "general";
};

export async function getCombinedSpeciesByZone(zoneCode){
  const pool = getPool();

  // zone -> area
  const [[zone]] = await pool.query(
    "SELECT fishing_spot AS code, area FROM ZONE WHERE fishing_spot = ? LIMIT 1",
    [zoneCode]
  );
  if (!zone) return null;
  const area = zone.area;


  const [spotRows] = await pool.query(
    `SELECT species, daily_limit, min_size_cm, max_size_cm, 'spot' AS source
     FROM QUOTAS_SPOT
     WHERE fishing_spot = ?
     ORDER BY species`, [zoneCode]
  );

  
  async function fetchGeneral(whereSql, params, tag){
    const [rows] = await pool.query(
      `
      SELECT qg.species, qg.daily_limit, qg.min_size_cm, qg.max_size_cm, 'general' AS source
      FROM QUOTAS_GENERAL qg
      WHERE ${whereSql}
        AND NOT EXISTS (
          SELECT 1 FROM QUOTAS_SPOT qs
          WHERE qs.fishing_spot = ? AND qs.species = qg.species
        )
      ORDER BY qg.species ASC
      `,
      [...params, zoneCode]
    );
    for (const r of rows) r._match = `general:${tag}`;
    return rows;
  }

  // 2) GENERAL exact
  let generalRows = await fetchGeneral("qg.area_desc = ?", [area], "exact");

  // 3) GENERAL fuzzy
  if (generalRows.length === 0 && area) {
    generalRows = await fetchGeneral("qg.area_desc LIKE ?", [`%${area}%`], "fuzzy");
  }

  // 4) GENERAL statewide fallback
  if (generalRows.length === 0) {
    generalRows = await fetchGeneral("qg.area_desc = 'All Victorian Waters'", [], "statewide");
  }

 
  const merged = new Map();
  for (const r of generalRows) merged.set(r.species, r);
  for (const r of spotRows) merged.set(r.species, r);

  const speciesList = Array.from(merged.keys());
  if (speciesList.length === 0) {
    return {
      meta: { zone: zoneCode, area, counts: { endangered:0, invasive:0, general:0 } },
      groups: { endangered:[], invasive:[], general:[] }
    };
  }

  
  const placeholders = speciesList.map(()=>"?").join(",");
  const [fishRows] = await pool.query(
    `SELECT species, endangered_status, extinction_risk, image, sources
     FROM FISH WHERE species IN (${placeholders})`,
    speciesList
  );
  const fMap = new Map(fishRows.map(r => [r.species, r]));


  const groups = { endangered:[], invasive:[], general:[] };
  for (const [sp, rule] of merged.entries()){
    const f = fMap.get(sp) || {};
    const key = toKey(f.endangered_status);
    groups[key].push({
      species: sp,
      daily_limit: rule.daily_limit,
      min_size_cm: rule.min_size_cm,
      max_size_cm: rule.max_size_cm,
      endangered_status: f.endangered_status || null,
      extinction_risk: f.extinction_risk || null,
      image: f.image || null,
      sources: f.sources || null,
      source: rule.source,
      area,
      zone_code: zoneCode,
      _match: rule._match || rule.source
    });
  }

  for (const k of Object.keys(groups)) {
    groups[k].sort((a,b)=>a.species.localeCompare(b.species));
  }

  return {
    meta: {
      zone: zoneCode,
      area,
      counts: {
        endangered: groups.endangered.length,
        invasive: groups.invasive.length,
        general: groups.general.length
      }
    },
    groups
  };
}
