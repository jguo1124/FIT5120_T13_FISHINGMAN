// src/services/repo/sqlRepo.js
import { getPool } from './mysqlPool.js';

/** Get species basic info by code */
export async function getSpeciesByCode(code) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT code, common_name FROM species WHERE code = ?',
    [code]
  );
  return rows[0] || null;
}

/** Get zone basic info by code */
export async function getZoneByCode(zoneCode) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT code FROM zones WHERE code = ?',
    [zoneCode]
  );
  return rows[0] || null;
}

/**
 * Snapshot of rules for (species x zone)
 * @returns
 * {
 *   species: { code, common_name },
 *   zone:    { code },
 *   rule: {
 *     min_cm, max_cm, daily_bag_limit, seasonal_limit,
 *     season_window: { start, end } | null
 *   } | null,
 *   seasons: [{ from, to }, ...],
 *   zone_restrictions: [
 *     { code, category, title, details, effective_from, effective_to, references:[], species_codes?:[] }, ...
 *   ]
 * }
 */
export async function getRuleSnapshot(speciesCode, zoneCode, onDateStr) {
  const pool = getPool();
  const onDate = onDateStr ? new Date(onDateStr) : new Date(); // reserved for future date-based filters

  // 1) Validate existence of species & zone
  const [[species]] = await pool.query(
    'SELECT code, common_name FROM species WHERE code = ?',
    [speciesCode]
  );
  const [[zone]] = await pool.query(
    'SELECT code FROM zones WHERE code = ?',
    [zoneCode]
  );
  if (!species || !zone) return null;

  // 2) Main rule (size/quotas/season window) — format dates as strings
  const [[rule]] = await pool.query(
    `SELECT
        size_min_cm,
        size_max_cm,
        daily_limit,
        seasonal_limit,
        DATE_FORMAT(season_window_start, '%Y-%m-%d') AS season_window_start,
        DATE_FORMAT(season_window_end,   '%Y-%m-%d') AS season_window_end
     FROM species_zone_rules
     WHERE species_code = ? AND zone_code = ?
     LIMIT 1`,
    [speciesCode, zoneCode]
  );

  // 3) Closed seasons (multiple intervals) — format dates as strings
  const [seasons] = await pool.query(
    `SELECT
        DATE_FORMAT(closed_from, '%Y-%m-%d') AS \`from\`,
        DATE_FORMAT(closed_to,   '%Y-%m-%d')   AS \`to\`
     FROM species_zone_closed_seasons
     WHERE species_code = ? AND zone_code = ?
     ORDER BY closed_from`,
    [speciesCode, zoneCode]
  );

  // 4) Zone-wide restrictions — format dates as strings
  const [restrictions] = await pool.query(
    `SELECT
        id,
        code,
        category,
        title,
        details,
        DATE_FORMAT(effective_from, '%Y-%m-%d') AS effective_from,
        DATE_FORMAT(effective_to,   '%Y-%m-%d') AS effective_to
     FROM zone_restrictions
     WHERE zone_code = ?
     ORDER BY id`,
    [zoneCode]
  );

  // 5) Enrich restrictions with references and specific species codes
  const ids = restrictions.map(r => r.id);
  const refsByRid = new Map();     // restriction_id -> [url]
  const speciesByRid = new Map();  // restriction_id -> [species_code]

  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');

    const [refs] = await pool.query(
      `SELECT restriction_id, url
       FROM zone_restriction_references
       WHERE restriction_id IN (${placeholders})`,
      ids
    );
    for (const r of refs) {
      const list = refsByRid.get(r.restriction_id) || [];
      list.push(r.url);
      refsByRid.set(r.restriction_id, list);
    }

    const [specs] = await pool.query(
      `SELECT restriction_id, species_code
       FROM zone_restriction_species
       WHERE restriction_id IN (${placeholders})`,
      ids
    );
    for (const s of specs) {
      const list = speciesByRid.get(s.restriction_id) || [];
      list.push(s.species_code);
      speciesByRid.set(s.restriction_id, list);
    }
  }

  const zone_restrictions = restrictions.map(r => ({
    code: r.code,
    category: r.category,
    title: r.title,
    details: r.details,
    effective_from: r.effective_from, // 'YYYY-MM-DD' | null
    effective_to: r.effective_to,     // 'YYYY-MM-DD' | null
    references: refsByRid.get(r.id) || [],
    ...(speciesByRid.get(r.id)?.length ? { species_codes: speciesByRid.get(r.id) } : {})
  }));

  // 6) Aggregate result
  return {
    species: { code: species.code, common_name: species.common_name },
    zone: { code: zone.code },
    rule: rule
      ? {
          min_cm: rule.size_min_cm,
          max_cm: rule.size_max_cm,
          daily_bag_limit: rule.daily_limit,
          seasonal_limit: rule.seasonal_limit,
          season_window:
            rule.season_window_start && rule.season_window_end
              ? { start: rule.season_window_start, end: rule.season_window_end }
              : null
        }
      : null,
    seasons,          // [{ from:'YYYY-MM-DD', to:'YYYY-MM-DD' }]
    zone_restrictions // [...]
  };
}

/**
 * Get the max regulation version for a zone (for ETag generation).
 * Backwards-compatible: if column `reg_version` is missing, fall back to 0.
 */
export async function getZoneMaxRegVersion(zoneCode) {
  const pool = getPool();
  try {
    const [[a]] = await pool.query(
      `SELECT COALESCE(MAX(reg_version),0) AS v
       FROM species_zone_rules WHERE zone_code = ?`,
      [zoneCode]
    );
    const [[b]] = await pool.query(
      `SELECT COALESCE(MAX(reg_version),0) AS v
       FROM zone_restrictions WHERE zone_code = ?`,
      [zoneCode]
    );
    return Math.max(a?.v || 0, b?.v || 0);
  } catch (err) {
    // MySQL ER_BAD_FIELD_ERROR (1054) or message containing "Unknown column"
    if (err?.code === 'ER_BAD_FIELD_ERROR' || /Unknown column 'reg_version'/.test(String(err?.message))) {
      return 0; // no version column -> fallback
    }
    throw err;
  }
}

/**
 * Get a zone-wide snapshot for all species.
 * Returns an array where each item represents one species.
 */
export async function getZoneRulesSnapshotAll(zoneCode, onDateStr) {
  const pool = getPool();

  // 1) Base rules (one row per species)
  const [rules] = await pool.query(
    `SELECT
        r.species_code,
        s.common_name,
        r.size_min_cm, r.size_max_cm,
        r.daily_limit, r.seasonal_limit,
        DATE_FORMAT(r.season_window_start, '%Y-%m-%d') AS season_window_start,
        DATE_FORMAT(r.season_window_end,   '%Y-%m-%d') AS season_window_end
     FROM species_zone_rules r
     JOIN species s ON s.code = r.species_code
     WHERE r.zone_code = ?
     ORDER BY r.species_code`,
    [zoneCode]
  );
  if (rules.length === 0) return [];

  // 2) Batch fetch all closed seasons for involved species
  const speciesCodes = [...new Set(rules.map(r => r.species_code))];
  const placeholders = speciesCodes.map(() => '?').join(',');
  const params = [zoneCode, ...speciesCodes];

  const [seasonsRows] = await pool.query(
    `SELECT
        species_code,
        DATE_FORMAT(closed_from, '%Y-%m-%d') AS \`from\`,
        DATE_FORMAT(closed_to,   '%Y-%m-%d')   AS \`to\`
     FROM species_zone_closed_seasons
     WHERE zone_code = ? AND species_code IN (${placeholders})
     ORDER BY species_code, closed_from`,
    params
  );

  const seasonsBySpecies = new Map();
  for (const row of seasonsRows) {
    const list = seasonsBySpecies.get(row.species_code) || [];
    list.push({ from: row.from, to: row.to });
    seasonsBySpecies.set(row.species_code, list);
  }

  // 3) Zone restrictions + references + limited-species bindings
  const [restrictions] = await pool.query(
    `SELECT
        id, code, category, title, details,
        DATE_FORMAT(effective_from, '%Y-%m-%d') AS effective_from,
        DATE_FORMAT(effective_to,   '%Y-%m-%d') AS effective_to
     FROM zone_restrictions
     WHERE zone_code = ?
     ORDER BY id`,
    [zoneCode]
  );

  const ridList = restrictions.map(r => r.id);
  const refsByRid = new Map();
  const speciesByRid = new Map();

  if (ridList.length > 0) {
    const p2 = ridList.map(() => '?').join(',');

    const [refs] = await pool.query(
      `SELECT restriction_id, url
       FROM zone_restriction_references
       WHERE restriction_id IN (${p2})`,
      ridList
    );
    for (const r of refs) {
      const list = refsByRid.get(r.restriction_id) || [];
      list.push(r.url);
      refsByRid.set(r.restriction_id, list);
    }

    const [specs] = await pool.query(
      `SELECT restriction_id, species_code
       FROM zone_restriction_species
       WHERE restriction_id IN (${p2})`,
      ridList
    );
    for (const s of specs) {
      const list = speciesByRid.get(s.restriction_id) || [];
      list.push(s.species_code);
      speciesByRid.set(s.restriction_id, list);
    }
  }

  const zone_restrictions = restrictions.map(r => ({
    code: r.code,
    category: r.category,
    title: r.title,
    details: r.details,
    effective_from: r.effective_from,
    effective_to: r.effective_to,
    references: refsByRid.get(r.id) || [],
    ...(speciesByRid.get(r.id)?.length ? { species_codes: speciesByRid.get(r.id) } : {})
  }));

  // 4) Output (one item per species)
  return rules.map(r => ({
    species: { code: r.species_code, common_name: r.common_name },
    zone: { code: zoneCode },
    rule: {
      min_cm: r.size_min_cm,
      max_cm: r.size_max_cm,
      daily_bag_limit: r.daily_limit,
      seasonal_limit: r.seasonal_limit,
      season_window:
        r.season_window_start && r.season_window_end
          ? { start: r.season_window_start, end: r.season_window_end }
          : null
    },
    seasons: seasonsBySpecies.get(r.species_code) || [],
    zone_restrictions
  }));
}
