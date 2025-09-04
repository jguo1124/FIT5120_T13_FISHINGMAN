// src/lib/api.js
// Base URL: set in .env, e.g. VITE_API_BASE=http://localhost:8080/api/v1
const BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

// Simple in-memory ETag cache: key = full URL
const etagCache = new Map();

/** Low-level GET with ETag support */
async function getJson(fullUrl) {
  const cached = etagCache.get(fullUrl);
  const headers = {};
  if (cached?.etag) headers["If-None-Match"] = cached.etag;

  const res = await fetch(fullUrl, { headers, cache: "no-store" });

  if (res.status === 304 && cached) return cached.data;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text.slice(0, 160)}`);
  }

  const etag = res.headers.get("ETag") || "";
  const data = await res.json();
  if (etag) etagCache.set(fullUrl, { etag, data });
  return data;
}

/** Helper: BASE + path (path must start with "/") */
function buildUrl(path, params) {
  const url = new URL((BASE.endsWith("/") ? BASE.slice(0, -1) : BASE) + path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && v !== "" && url.searchParams.set(k, v));
  return url.toString();
}

/** GET /species */
export async function fetchSpeciesList() {
  return getJson(buildUrl("/species"));
}

/** GET /species/:code */
export async function fetchSpeciesDetail(code) {
  return getJson(buildUrl(`/species/${encodeURIComponent(code)}`));
}

/** GET /zone/:zoneCode/rules[?onDate=YYYY-MM-DD&species=code] */
export async function fetchZoneRules({ zoneCode, onDate, species } = {}) {
  if (!zoneCode) throw new Error("zoneCode is required");
  const url = buildUrl(`/zone/${encodeURIComponent(zoneCode)}/rules`, {
    onDate,
    species,
  });
  return getJson(url);
}

/** optional: clear cache */
export function clearApiCache() { etagCache.clear(); }
