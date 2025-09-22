import express from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const BASE_URL = "https://api.openweathermap.org";
const RATE_LIMIT_WINDOW_MS = Number.parseInt(process.env.WEATHER_RATE_WINDOW_MS || "60000", 10);
const RATE_LIMIT_MAX = Number.parseInt(process.env.WEATHER_RATE_MAX || "30", 10);

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth, limiter);

function requireEnvApiKey() {
  const key = process.env.OPENWEATHER_API_KEY || process.env.OW_API_KEY || process.env.OPENWEATHER_KEY;
  if (!key) {
    throw Object.assign(new Error("Missing OpenWeather API key (set OPENWEATHER_API_KEY)"), {
      status: 500,
      code: "missing_api_key",
    });
  }
  return key;
}

function sanitizeCoordinate(value, { label, min, max }) {
  const num = Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(num) || num < min || num > max) {
    throw Object.assign(new Error(`Invalid ${label}`), { status: 400, code: "bad_request" });
  }
  return Number(num.toFixed(4));
}

const allowedExcludes = new Set(["current", "minutely", "hourly", "daily", "alerts"]);
function sanitizeExclude(value) {
  if (!value) return undefined;
  const parts = String(value)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => allowedExcludes.has(p));
  return parts.length ? parts.join(",") : undefined;
}

const allowedUnits = new Set(["metric", "imperial", "standard"]);
function sanitizeUnits(value) {
  if (!value) return undefined;
  const trimmed = String(value).trim().toLowerCase();
  return allowedUnits.has(trimmed) ? trimmed : undefined;
}

const langPattern = /^[a-z]{2}(?:-[A-Z]{2})?$/u;
function sanitizeLang(value) {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  return langPattern.test(trimmed) ? trimmed : undefined;
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/u;
function sanitizeDate(value) {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  return datePattern.test(trimmed) ? trimmed : undefined;
}

const tzPattern = /^[A-Za-z0-9_\-/]+$/u;
function sanitizeTz(value) {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  return tzPattern.test(trimmed) ? trimmed : undefined;
}

function sanitizeTimestamp(value) {
  if (!value) return undefined;
  const num = Number.parseInt(String(value), 10);
  if (!Number.isFinite(num) || num <= 0) {
    throw Object.assign(new Error("Invalid timestamp"), { status: 400, code: "bad_request" });
  }
  return num;
}

function buildUrl(path, query) {
  const url = new URL(path, BASE_URL);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
  return url.toString();
}

async function proxyJson(url, res) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const r = await fetch(url, { signal: controller.signal });
    const text = await r.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (_) {
      payload = text;
    }
    if (!r.ok) {
      return res.status(r.status).json({ error: { code: r.status, message: r.statusText }, raw: payload });
    }
    const etag = r.headers.get("etag");
    if (etag) res.set("ETag", etag);
    return res.json(payload);
  } catch (err) {
    if (err?.name === "AbortError") {
      return res.status(504).json({ error: { code: "timeout", message: "Upstream request timed out" } });
    }
    return res.status(err?.status || 500).json({ error: { code: err?.code || "upstream_error", message: String(err?.message || err) } });
  } finally {
    clearTimeout(timeout);
  }
}

router.get("/onecall", async (req, res) => {
  try {
    const lat = sanitizeCoordinate(req.query.lat, { label: "latitude", min: -90, max: 90 });
    const lon = sanitizeCoordinate(req.query.lon, { label: "longitude", min: -180, max: 180 });
    const appid = requireEnvApiKey();
    const exclude = sanitizeExclude(req.query.exclude);
    const units = sanitizeUnits(req.query.units);
    const lang = sanitizeLang(req.query.lang);
    const url = buildUrl("/data/3.0/onecall", { lat, lon, exclude, units, lang, appid });
    return proxyJson(url, res);
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ error: { code: err.code || "bad_request", message: err.message } });
  }
});

router.get("/timemachine", async (req, res) => {
  try {
    const lat = sanitizeCoordinate(req.query.lat, { label: "latitude", min: -90, max: 90 });
    const lon = sanitizeCoordinate(req.query.lon, { label: "longitude", min: -180, max: 180 });
    const dt = sanitizeTimestamp(req.query.dt);
    const appid = requireEnvApiKey();
    const units = sanitizeUnits(req.query.units);
    const lang = sanitizeLang(req.query.lang);
    const url = buildUrl("/data/3.0/onecall/timemachine", { lat, lon, dt, units, lang, appid });
    return proxyJson(url, res);
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ error: { code: err.code || "bad_request", message: err.message } });
  }
});

router.get("/day_summary", async (req, res) => {
  try {
    const lat = sanitizeCoordinate(req.query.lat, { label: "latitude", min: -90, max: 90 });
    const lon = sanitizeCoordinate(req.query.lon, { label: "longitude", min: -180, max: 180 });
    const date = sanitizeDate(req.query.date);
    if (!date) {
      throw Object.assign(new Error("Invalid date format (expected YYYY-MM-DD)"), { status: 400, code: "bad_request" });
    }
    const tz = sanitizeTz(req.query.tz);
    const appid = requireEnvApiKey();
    const units = sanitizeUnits(req.query.units);
    const lang = sanitizeLang(req.query.lang);
    const url = buildUrl("/data/3.0/onecall/day_summary", { lat, lon, date, tz, units, lang, appid });
    return proxyJson(url, res);
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ error: { code: err.code || "bad_request", message: err.message } });
  }
});

router.get("/overview", async (req, res) => {
  try {
    const lat = sanitizeCoordinate(req.query.lat, { label: "latitude", min: -90, max: 90 });
    const lon = sanitizeCoordinate(req.query.lon, { label: "longitude", min: -180, max: 180 });
    const date = sanitizeDate(req.query.date);
    const appid = requireEnvApiKey();
    const units = sanitizeUnits(req.query.units);
    const url = buildUrl("/data/3.0/onecall/overview", { lat, lon, date, units, appid });
    return proxyJson(url, res);
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ error: { code: err.code || "bad_request", message: err.message } });
  }
});

export default router;
