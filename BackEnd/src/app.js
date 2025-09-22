import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import speciesRouter from "./routes/species.js";
import zoneRouter from "./routes/zone.js";
import protectedRouter from "./Endangered_species/routes.js";
import weatherRouter from "./routes/weather.js";
import { requireAuth, requireRole } from "./middleware/auth.js";
import { getPool } from "./services/repo/mysqlPool.js";

dotenv.config();

const app = express();

const defaultDevOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const rawOrigins = process.env.CORS_ORIGIN;
let allowedOrigins = rawOrigins
  ? rawOrigins.split(",").map((o) => o.trim()).filter(Boolean)
  : [];
if (!allowedOrigins.length && process.env.NODE_ENV !== "production") {
  allowedOrigins = defaultDevOrigins;
}

if (!allowedOrigins.length) {
  console.warn("[cors] No allowed origins configured; browser requests may be blocked.");
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.length) return callback(null, false);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: false,
  exposedHeaders: ["ETag"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use((_, res, next) => {
  res.set("Access-Control-Expose-Headers", "ETag");
  next();
});
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_, res) => res.send("ok"));

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

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/species", speciesRouter);
app.use("/api/v1", zoneRouter);

app.use("/api/v1/protected", requireAuth, requireRole("admin"), protectedRouter);

app.use("/api/v1/weather", weatherRouter);

app.use("/api", (req, res) => {
  res.status(404).json({
    error: { code: "not_found", message: `No route for ${req.method} ${req.originalUrl}` },
  });
});

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
