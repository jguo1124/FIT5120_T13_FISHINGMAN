// src/lib/api.js
if (import.meta.env.DEV) {
  console.log('[API] BASE =', import.meta.env.VITE_API_BASE ?? '/api/v1');
}

// Base URL comes from .env (e.g. VITE_API_BASE=http://localhost:8080/api/v1).
// When not provided, default to relative "/api/v1" so Cloudflare Pages + redirects work.
const BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

// Very small in-memory ETag cache. Key = full request URL.
const etagCache = new Map();

/**
 * Low-level GET helper with ETag support.
 * - Sends If-None-Match if we already have a cached ETag for this URL.
 * - If server returns 304, we reuse the cached data.
 * - Otherwise we parse JSON and store {etag, data} in the cache.
 */
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

/**
 * Build a URL: BASE + path (path must start with "/").
 * `params` are appended as querystring if provided.
 */
function buildUrl(path, params) {
  const base = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
  const url = new URL(base + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

/** GET /species to list of species [{ code, common_name, ... }] */
export async function fetchSpeciesList() {
  return getJson(buildUrl("/species"));
}

/** GET /species/:code to details for a species */
export async function fetchSpeciesDetail(code) {
  return getJson(buildUrl(`/species/${encodeURIComponent(code)}`));
}

/** GET /zones to list all fishing spots [{ code, area }] */
export async function fetchZones() {
  return getJson(buildUrl("/zones"));
}

/**
 * GET /zone/:zoneCode/rules[?onDate=YYYY-MM-DD&species=code]
 * - zoneCode is required (it is the exact `fishing_spot` string).
 * - If `species` is provided, backend returns a single object (one rule).
 * - Else it returns an array of rules (all species in the zone).
 */
export async function fetchZoneRules({ zoneCode, onDate, species } = {}) {
  if (!zoneCode) throw new Error("zoneCode is required");
  const url = buildUrl(`/zone/${encodeURIComponent(zoneCode)}/rules`, {
    onDate,
    species,
  });
  return getJson(url);
}

/** Clear ETag cache (optional utility). */
export function clearApiCache() {
  etagCache.clear();
}