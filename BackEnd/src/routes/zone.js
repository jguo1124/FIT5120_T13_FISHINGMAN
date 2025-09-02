import { Router } from "express";
import { getZoneRules, getCurrentVersionId } from "../services/speciesService.js";

const router = Router();
const norm = (s) => String(s || "").trim().replace(/^W\//i, "").replace(/^"+|"+$/g, "");

// GET /api/v1/zone/:zoneCode/rules?onDate=YYYY-MM-DD
router.get("/zone/:zoneCode/rules", async (req, res) => {
  try {
    const { zoneCode } = req.params;
    const onDate = req.query.onDate ? String(req.query.onDate) : undefined;

    const version = await getCurrentVersionId();
    const etag = `W/"zone-${zoneCode}-v${version}"`;
    res.set("Access-Control-Expose-Headers", "ETag");

    // Conditional GET → 304
    const inm = req.headers["if-none-match"];
    if (typeof inm === "string") {
      const want = norm(etag);
      const hit = inm.split(",").some((s) => norm(s) === want || s.trim() === "*");
      if (hit) { res.set("ETag", etag); return res.status(304).end(); }
    }

    const { zoneRestrictions, list } = await getZoneRules(zoneCode, onDate);

    res.set("ETag", etag);
    return res.json({
      zone: zoneCode,
      at: onDate || new Date().toISOString().slice(0, 10),
      zone_restrictions: zoneRestrictions,
      species_rules: list,
      meta: { version_id: version, updated_at: new Date().toISOString() }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { code: "internal_error" } });
  }
});

export default router;
