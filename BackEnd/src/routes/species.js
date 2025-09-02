import { Router } from "express";
import { getRulesSnapshot, getCurrentVersionId } from "../services/speciesService.js";

const r = Router();

r.get("/", (_req, res) => {
  res.json({ items: ["snapper", "garfish"] });
});

r.get("/:code", async (req, res) => {
  const { code } = req.params;
  const { zone, onDate } = req.query;

  if (!zone) return res.status(400).json({ error: { code: "requires_zone" } });

  const out = await getRulesSnapshot(code, String(zone), onDate);
  if (!out) return res.status(404).json({ error: { code: "species_not_found" } });

  const ver = await getCurrentVersionId();

  res.set("Access-Control-Expose-Headers", "ETag");
  res.set("ETag", `W/"v${ver}"`);

  out.meta = { ...(out.meta || {}), version_id: ver, updated_at: out.meta?.updated_at || new Date().toISOString() };

  return res.json(out);
});

export default r;
