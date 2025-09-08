// src/routes/zone.js
import { Router } from "express";
import {
  // repo contract: getRuleSnapshot(zoneCode, speciesCode)
  getRuleSnapshot,
  // repo contract: getZoneRulesSnapshotAll(zoneCode, opts? { species })
  getZoneRulesSnapshotAll,
  // real DB has no version concept; we return a constant (e.g. 1) for ETag
  getZoneMaxRegVersion,
} from "../services/repo/index.js";
import { getPool } from "../services/repo/mysqlPool.js";

const router = Router();

/**
 * GET /api/v1/zones
 * Return all fishing spots for the dropdown.
 * Response: [{ code: <fishing_spot>, area: <area> }, ...]
 */
router.get("/zones", async (_req, res, next) => {
  try {
    const pool = getPool();
    // NOTE: If your table names are lowercase on RDS, change `ZONE` -> `zone`.
    const [rows] = await pool.query(
      "SELECT `fishing_spot` AS code, `area` FROM `ZONE` ORDER BY `fishing_spot`"
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/v1/zone/:zoneCode/rules
 * - If `?species=xxx` is present → return the rule for that species only.
 * - Else → return all species rules for the given zone.
 * - ETag is used to support client-side caching.
 */
router.get("/zone/:zoneCode/rules", async (req, res, next) => {
  try {
    const { zoneCode } = req.params;
    const { species, onDate } = req.query; // real DB ignores onDate; we keep it only for ETag

    // Optional: early check to avoid confusing 404 messages
    const pool = getPool();
    const [exists] = await pool.query(
      "SELECT 1 FROM `ZONE` WHERE `fishing_spot` = ? LIMIT 1",
      [zoneCode]
    );
    if (exists.length === 0) {
      return res.status(404).json({ error: "Unknown zone" });
    }

    // Build ETag
    const maxVer = await getZoneMaxRegVersion(String(zoneCode));
    const etag = `W/"rules-v${maxVer}-${zoneCode}-${species || ""}-${onDate || ""}"`;

    // If-None-Match short-circuit
    const inm = req.header("If-None-Match");
    if (inm && inm === etag) {
      res.set("ETag", etag);
      return res.status(304).end();
    }

    let data;
    if (species) {
      // IMPORTANT: repo signature expects (zoneCode, speciesCode)
      data = await getRuleSnapshot(String(zoneCode), String(species));
      if (!data) {
        res.set("ETag", etag);
        return res.status(404).json({ error: "No data found for species/zone" });
      }
    } else {
      data = await getZoneRulesSnapshotAll(String(zoneCode));
      if (!data || data.length === 0) {
        res.set("ETag", etag);
        return res.status(404).json({ error: "No data for zone" });
      }
    }

    res.set("ETag", etag);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

export default router;
