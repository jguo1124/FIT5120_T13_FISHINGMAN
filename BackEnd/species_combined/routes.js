import { Router } from "express";
import { getPool } from "../services/repo/mysqlPool.js";
import { getCombinedSpeciesByZone } from "./repo.js";

const router = Router();

// GET /api/v1/species_combined/:zoneCode?onDate=YYYY-MM-DD
router.get("/:zoneCode", async (req, res, next) => {
  try {
    const { zoneCode } = req.params;

    const pool = getPool();
    const [exists] = await pool.query(
      "SELECT 1 FROM ZONE WHERE fishing_spot = ? LIMIT 1",
      [zoneCode]
    );
    if (exists.length === 0) return res.status(404).json({ error: "Unknown zone" });

    const data = await getCombinedSpeciesByZone(zoneCode);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;