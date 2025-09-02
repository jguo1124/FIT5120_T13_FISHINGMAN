// src/lib/api.js
// Base URL: from env or default to relative /api/v1
const BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

// simple in-memory ETag cache
const etagCache = new Map();

/**
 * pull zone rules from backend, with ETag caching
 * @param {string} zoneCode - e.g. "NSW-1"
 * @param {string} [onDate] - e.g. "2024-06-01" (YYYY-MM-DD), optional
 * @return {Promise<Object>} - rules data
 * @throws {Error} - on network or server error
 */
export async function fetchZoneRules(zoneCode, onDate) {
  const key = `${zoneCode}|${onDate || ""}`;
  const cached = etagCache.get(key);

  const url = new URL(
    `${BASE}/zone/${encodeURIComponent(zoneCode)}/rules`,
    window.location.origin
  );
  if (onDate) url.searchParams.set("onDate", onDate);

  const headers = {};
  if (cached?.etag) headers["If-None-Match"] = cached.etag;

  const res = await fetch(url.toString(), { headers, cache: "no-store" });

  // 304 Not Modified - return cached data
  if (res.status === 304 && cached) {
    return cached.data;
  }

  // other non-2xx errors
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text.slice(0, 120)}`);
  }

  // 2xx - parse and cache
  const etag = res.headers.get("ETag") || "";
  const data = await res.json();
  etagCache.set(key, { etag, data });
  return data;
}
