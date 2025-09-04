// src/routes/species.js
import { Router } from "express";
import { getSpeciesByCode } from "../services/repo/index.js";
import { getPool } from "../services/repo/mysqlPool.js";

const router = Router();

/**
 * GET /api/v1/species
 * Returns a list of all species with their code and common name.
 */
router.get("/", async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT code, common_name FROM species ORDER BY code"
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/v1/species/:code
 * Returns details for a specific species.
 * - 404 if the species code does not exist.
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
