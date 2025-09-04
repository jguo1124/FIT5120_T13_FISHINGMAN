// src/routes/zone.js
import { Router } from "express";
import { getRuleSnapshot, getZoneRulesSnapshotAll, getZoneMaxRegVersion } from "../services/repo/index.js";

const router = Router();

/**
 * GET /zone/:zoneCode/rules
 * Returns fishing rules for a given zone.
 * - If `species` query is provided → return rules for that species only
 * - If no `species` query → return rules for all species in that zone
 * 
 * Supports ETag-based caching:
 * - Builds an ETag based on the latest regulation version, zone code, and optional date
 * - If client sends matching If-None-Match → respond with 304 (Not Modified)
 */
router.get("/zone/:zoneCode/rules", async (req, res, next) => {
  try {
    const { zoneCode } = req.params;
    const { species, onDate } = req.query;

    // Compute ETag (weak validator style)
    const maxVer = await getZoneMaxRegVersion(String(zoneCode));
    const etag = `W/"rules-v${maxVer}-${zoneCode}-${onDate || ""}"`;

    // Return 304 if client ETag matches
    const inm = req.header("If-None-Match");
    if (inm && inm === etag) {
      res.set("ETag", etag);
      return res.status(304).end();
    }

    let data;
    if (species) {
      // Fetch rules for a single species
      data = await getRuleSnapshot(String(species), String(zoneCode), String(onDate || ""));
      if (!data) return res.status(404).json({ error: "No data found for species/zone" });
    } else {
      // Fetch rules for all species in this zone
      data = await getZoneRulesSnapshotAll(String(zoneCode), String(onDate || ""));
      if (!data || data.length === 0) return res.status(404).json({ error: "No data for zone" });
    }

    res.set("ETag", etag);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

export default router;
