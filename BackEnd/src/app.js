// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Import routers
import speciesRouter from "./routes/species.js";
import zoneRouter from "./routes/zone.js";
import weatherRouter from "./routes/weather.js";

import { getPool } from "./services/repo/mysqlPool.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    exposedHeaders: ["ETag"],
  })
);

// Ensure ETag header is exposed to the client
app.use((req, res, next) => {
  res.set("Access-Control-Expose-Headers", "ETag");
  next();
});

// Parse JSON bodies
app.use(express.json());

/** 
 * Light health check for Render 
 * (does not depend on database)
 */
app.get("/healthz", (_, res) => {
  res.send("ok");
});

/**
 * Database health check
 */
app.get("/api/v1/health", async (_, res) => {
  try {
    const pool = getPool();
    const [[ping]] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: ping.ok === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Mount routers
app.use("/api/v1/species", speciesRouter); // e.g. /api/v1/species/:code
app.use("/api/v1", zoneRouter);            // e.g. /api/v1/zone/:zoneCode/rules
app.use("/api/v1/weather", weatherRouter); // e.g. /api/v1/weather/onecall

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      code: "internal_error",
      message: process.env.NODE_ENV === "production" ? "Server error" : String(err?.message || err),
      stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
    },
  });
});

export default app;

// Start server unless running in test mode
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`API on http://localhost:${port}`));
}
