// src/routes/species.js
import { Router } from "express";
import { getSpeciesByCode } from "../services/repo/index.js";
import { getPool } from "../services/repo/mysqlPool.js";

const router = Router();

/**
 * GET /api/v1/species
 * 返回所有物种。真实库用 FISH 表，没有 common_name，这里用 species 占位到 common_name。
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
 * 物种详情（走 repo 内已改好的 getSpeciesByCode → 查 FISH）
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
