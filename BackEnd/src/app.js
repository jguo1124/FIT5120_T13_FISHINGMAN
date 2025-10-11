// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Epic 1 routers
import speciesRouter from "./routes/species.js";
import zoneRouter from "./routes/zone.js";

// Epic 2 routers
import protectedRouter from "./Endangered_species/routes.js";


import weatherRouter from "./routes/weather.js";

import { getPool } from "./services/repo/mysqlPool.js";
import knowledgeRouter from './fishingman_knowledge/knowledge_routes.js';


dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || true,
    exposedHeaders: ["ETag"],
  })
);

app.use((_, res, next) => {
  res.set("Access-Control-Expose-Headers", "ETag");
  next();
});
app.use(express.json());

/**
 * Lightweight health check (does not depend on DB).
 */
app.get("/healthz", (_, res) => res.send("ok"));

/**
 * Health check for the real database (Epic 1).
 */
app.get("/api/v1/health", async (_, res) => {
  try {
    const pool = getPool("real");
    const [[ping]] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: ping.ok === 1, source: "real" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err), source: "real" });
  }
});

/**
 * Health check for the mock database (Epic 2).
 */
app.get("/api/v1/health/mock", async (_, res) => {
  try {
    const pool = getPool("mock");
    const [[ping]] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: ping.ok === 1, source: "mock" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err), source: "mock" });
  }
});

/**
 * Epic 1 routes
 */
app.use("/api/v1/species", speciesRouter); // e.g. /api/v1/species/:code
app.use("/api/v1", zoneRouter);            // e.g. /api/v1/zone/:zoneCode/rules

/**
 * Epic 2 routes
 */
app.use("/api/v1/protected", protectedRouter); // e.g. /api/v1/protected/species


app.use("/api/v1/weather", weatherRouter);

app.use('/api/v1/knowledge', knowledgeRouter);

app.use("/api", (req, res) => {
  res.status(404).json({
    error: { code: "not_found", message: `No route for ${req.method} ${req.originalUrl}` },
  });
});

/**
 * Global error handler.
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || "internal_error",
      message:
        process.env.NODE_ENV === "production"
          ? "Server error"
          : String(err?.message || err),
      stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
    },
  });
});

export default app;


if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`API on http://localhost:${port}`));
}
