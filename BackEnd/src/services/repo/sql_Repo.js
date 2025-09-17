// src/services/repo/sql_Repo.js
// Real DB layout: ZONE / QUOTAS_SPOT / QUOTAS_GENERAL / FISH
// NOTE: MySQL on Linux/RDS is case-sensitive for table names.
//       If your tables are lowercase, change the quoted names accordingly
//       or create views that map to the expected uppercase names.

import { getPool } from "./mysqlPool.js";

/* ========================= Species ========================= */

/**
 * Fetch a single species by code from FISH.
 * FISH has no "common_name"; we return the code and two extra attributes
 * so the API stays stable for the frontend.
 */
export async function getSpeciesByCode(code) {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT `species` AS code, `extinction_risk`, `endangered_status` FROM `FISH` WHERE `species` = ?",
    [code]
  );
  return rows[0] || null;
}

/**
 * List all species (used by /api/v1/species).
 */
export async function getSpeciesList() {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT `species` AS code, `extinction_risk`, `endangered_status` FROM `FISH` ORDER BY `species` ASC"
  );
  return rows;
}

/* ========================== Zones ========================== */

/**
 * Fetch a zone by code (code is actually the `fishing_spot` name).
 */
export async function getZoneByCode(zoneCode) {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT `fishing_spot` AS code, `area` FROM `ZONE` WHERE `fishing_spot` = ?",
    [zoneCode]
  );
  return rows[0] || null;
}

/* =================== Rules (SPOT + GENERAL) =================== */

/**
 * Return the "current rules snapshot" for a given zone.
 *
 * Merge strategy:
 *  - If a species exists in QUOTAS_SPOT for the fishing spot → prefer SPOT.
 *  - Otherwise use QUOTAS_GENERAL. To improve coverage we try multiple scopes:
 *      (1) exact match:       qg.area_desc = zone.area
 *      (2) fuzzy match:       qg.area_desc LIKE %zone.area%
 *      (3) statewide fallback qg.area_desc = 'All Victorian Waters'
 *  - All rule columns are VARCHAR in the real DB (e.g. "No Limit", "2 Litre").
 *    We forward them as-is to the frontend.
 *
 * @param {string} zoneCode  ZONE.fishing_spot (e.g. "Cape Liptrap Coastal Park")
 * @param {object} opts      Optional filters, e.g. { species: 'Black Bream' }
 * @returns {Array<{species, zone_code, area, daily_limit, size_min_cm, size_max_cm, source}>}
 */
export async function getZoneRulesSnapshotAll(zoneCode, opts = {}) {
  const pool = getPool();
  const zone = await getZoneByCode(zoneCode);
  if (!zone) return [];

  const area = zone.area;
  const speciesFilter = (opts.species || "").trim();

  /* ---------- 1) SPOT rules (highest priority) ---------- */
  const spotParams = [zoneCode];
  if (speciesFilter) spotParams.push(speciesFilter);

  const [spotRows] = await pool.query(
    `
    SELECT
      qs.species,
      qs.daily_limit,
      qs.min_size_cm AS size_min_cm,
      qs.max_size_cm AS size_max_cm,
      'spot' AS source
    FROM \`QUOTAS_SPOT\` qs
    WHERE qs.fishing_spot = ?
      ${speciesFilter ? "AND qs.species = ?" : ""}
    ORDER BY qs.species ASC
    `,
    spotParams
  );

  /* ---------- helper to query GENERAL with different predicates ---------- */
  async function fetchGeneral(whereSql, whereParams, matchTag) {
    const params = [...whereParams];
    if (speciesFilter) params.push(speciesFilter);
    // prevent duplicates: if a species exists in SPOT, don't return GENERAL for it
    params.push(zoneCode);

    const [rows] = await pool.query(
      `
      SELECT
        qg.species,
        qg.daily_limit,
        qg.min_size_cm AS size_min_cm,
        qg.max_size_cm AS size_max_cm,
        'general' AS source
      FROM \`QUOTAS_GENERAL\` qg
      WHERE ${whereSql}
        ${speciesFilter ? "AND qg.species = ?" : ""}
        AND NOT EXISTS (
          SELECT 1 FROM \`QUOTAS_SPOT\` qs
          WHERE qs.fishing_spot = ? AND qs.species = qg.species
        )
      ORDER BY qg.species ASC
      `,
      params
    );

    // Attach a non-breaking hint of which fallback matched; safe to ignore on FE.
    for (const r of rows) r._match = `general:${matchTag}`;
    return rows;
  }

  /* ---------- 2) GENERAL exact (area_desc = zone.area) ---------- */
  let generalRows = await fetchGeneral("qg.area_desc = ?", [area], "exact");

  /* ---------- 3) GENERAL fuzzy (LIKE %area%) if still empty ---------- */
  if (generalRows.length === 0 && area) {
    generalRows = await fetchGeneral("qg.area_desc LIKE ?", [`%${area}%`], "fuzzy");
  }

  /* ---------- 4) GENERAL statewide fallback if still empty ---------- */
  if (generalRows.length === 0) {
    generalRows = await fetchGeneral(
      "qg.area_desc = 'All Victorian Waters'",
      [],
      "statewide"
    );
  }

  /* ---------- Merge: GENERAL first, then override with SPOT ---------- */
  const merged = new Map();
  for (const r of generalRows) merged.set(r.species, r);
  for (const r of spotRows) merged.set(r.species, r);

  /* ---------- Normalize to the FE-friendly shape ---------- */
  return Array.from(merged.values()).map((r) => ({
    species: r.species,
    zone_code: zoneCode,
    area,
    daily_limit: r.daily_limit,     // string: e.g. "10" / "No Limit" / "2 Litre"
    size_min_cm: r.size_min_cm,     // string: e.g. "0" / "28" / "No Limit"
    size_max_cm: r.size_max_cm,     // string
    source: r.source,               // 'spot' | 'general' (debug)
    // compatibility placeholders (kept for old mock-era FE code)
    seasonal_limit: null,
    season_window_start: null,
    season_window_end: null,
    reg_version: 1,
    // optional hint for debugging which GENERAL scope matched
    _match: r._match || (r.source === "spot" ? "spot" : undefined),
  }));
}

/**
 * Fetch a single species rule in a zone.
 * We reuse the all-rules function with { species } so it benefits from the same
 * fallback/merge logic as the multi-species query.
 */
export async function getRuleSnapshot(zoneCode, speciesCode) {
  const rows = await getZoneRulesSnapshotAll(zoneCode, { species: speciesCode });
  return rows[0] || null;
}

/**
 * Mock-era API exposed a "max regulation version".
 * Real DB has no notion of versions; return a constant for ETag building.
 */
export async function getZoneMaxRegVersion() {
  return 1;
}
