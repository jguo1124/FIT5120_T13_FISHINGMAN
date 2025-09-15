// src/routes/weather.js
import express from "express";

const router = express.Router();

const BASE_URL = "https://api.openweathermap.org";

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
    // Try to parse JSON; if fail, return as-is
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (_) {
      payload = text;
    }
    if (!r.ok) {
      return res.status(r.status).json({ error: { code: r.status, message: r.statusText }, raw: payload });
    }
    // Forward ETag if present
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

// GET /api/v1/weather/onecall?lat=&lon=&exclude=&units=&lang=
router.get("/onecall", async (req, res) => {
  const { lat, lon, exclude, units, lang } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: { code: "bad_request", message: "Missing required query params: lat, lon" } });
  }
  const appid = requireEnvApiKey();
  const url = buildUrl("/data/3.0/onecall", { lat, lon, exclude, units, lang, appid });
  return proxyJson(url, res);
});

// GET /api/v1/weather/timemachine?lat=&lon=&dt=&units=&lang=
router.get("/timemachine", async (req, res) => {
  const { lat, lon, dt, units, lang } = req.query;
  if (!lat || !lon || !dt) {
    return res.status(400).json({ error: { code: "bad_request", message: "Missing required query params: lat, lon, dt" } });
  }
  const appid = requireEnvApiKey();
  const url = buildUrl("/data/3.0/onecall/timemachine", { lat, lon, dt, units, lang, appid });
  return proxyJson(url, res);
});

// GET /api/v1/weather/day_summary?lat=&lon=&date=&tz=&units=&lang=
router.get("/day_summary", async (req, res) => {
  const { lat, lon, date, tz, units, lang } = req.query;
  if (!lat || !lon || !date) {
    return res.status(400).json({ error: { code: "bad_request", message: "Missing required query params: lat, lon, date" } });
  }
  const appid = requireEnvApiKey();
  const url = buildUrl("/data/3.0/onecall/day_summary", { lat, lon, date, tz, units, lang, appid });
  return proxyJson(url, res);
});

// GET /api/v1/weather/overview?lat=&lon=&date=&units=
router.get("/overview", async (req, res) => {
  const { lat, lon, date, units } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: { code: "bad_request", message: "Missing required query params: lat, lon" } });
  }
  const appid = requireEnvApiKey();
  const url = buildUrl("/data/3.0/onecall/overview", { lat, lon, date, units, appid });
  return proxyJson(url, res);
});

export default router;

