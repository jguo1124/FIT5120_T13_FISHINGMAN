import { Router } from "express";
import { listEndangered, getEndangeredById } from "./repo.js";

const MAX_PAGE_SIZE = Number.parseInt(process.env.PROTECTED_MAX_PAGE_SIZE || "50", 10);
const router = Router();

function sanitizePage(value) {
  const parsed = Number.parseInt(String(value ?? "1"), 10);
  return Number.isNaN(parsed) ? 1 : Math.max(parsed, 1);
}

function sanitizePageSize(value) {
  const parsed = Number.parseInt(String(value ?? "12"), 10);
  if (Number.isNaN(parsed) || parsed < 1) return 12;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

router.get("/species", async (req, res, next) => {
  try {
    const page = sanitizePage(req.query.page);
    const pageSize = sanitizePageSize(req.query.pageSize);
    const q = (req.query.q || "").toString().trim();
    const status = (req.query.status || "").toString().trim();
    const data = await listEndangered({ q, page, pageSize, status });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/species/:id", async (req, res, next) => {
  try {
    const row = await getEndangeredById(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

export default router;
