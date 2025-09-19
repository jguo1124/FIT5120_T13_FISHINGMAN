// src/routes/species.js
import { Router } from "express";
import { getSpeciesByCode } from "../services/repo/index.js";
import { getPool } from "../services/repo/mysqlPool.js";

const router = Router();

/**
 * GET /api/v1/species
 *
 * Returns all species from the real database.
 * Data source: the FISH table.
 * - Note: The table does not have a `common_name` column,
 *   so the `species` value is duplicated into `common_name` as a placeholder.
 */
router.get("/", async (_req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT `species` AS code, `species` AS common_name, `extinction_risk`, `endangered_status` FROM `FISH` ORDER BY `species`"
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/v1/species/:code
 *
 * Returns details for a single species.
 * - Delegates to repo function `getSpeciesByCode`, which queries the FISH table.
 * - If no species is found for the provided code, a 404 is returned.
 */
router.get("/:code", async (req, res, next) => {
  try {
    const sp = await getSpeciesByCode(req.params.code);
    if (!sp) return res.status(404).json({ error: "Not found" });
    res.json(sp);
  } catch (e) {
    next(e);
  }
});

export default router;
