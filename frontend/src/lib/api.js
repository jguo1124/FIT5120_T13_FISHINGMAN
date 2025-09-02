// src/lib/api.js
// Base URL：确保 .env 里有 VITE_API_BASE=http://localhost:8080/api/v1
const BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

// 简单的内存缓存：key = zone|date
const etagCache = new Map();

/**
 * 拉取某个 zone 在某一天的所有规则（含 zone_restrictions + species_rules）
 * 自动带上 If-None-Match；后端若返回 304，则直接用缓存数据
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

  // 命中 304：直接返回缓存
  if (res.status === 304 && cached) {
    return cached.data;
  }

  // 其他非 2xx：抛错（并尽量把文本返回，方便排查）
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text.slice(0, 120)}`);
  }

  // 2xx：更新缓存并返回
  const etag = res.headers.get("ETag") || "";
  const data = await res.json();
  etagCache.set(key, { etag, data });
  return data;
}
