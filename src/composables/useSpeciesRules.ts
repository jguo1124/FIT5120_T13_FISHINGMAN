import { ref } from 'vue'

export type RulesSnapshot = {
  species: { code: string; common_name?: string };
  zone: string;
  size_limits: { min_cm: number|null; max_cm: number|null; message?: string };
  quotas: { daily_limit: number|null; seasonal_limit: number|null; season_window?: { start: string; end: string } | null; message?: string };
  season: { status: 'OPEN'|'CLOSED'; ui_badge: string; closed_ranges: {from:string; to:string}[]; next_closed_range: {from:string; to:string} | null };
  meta?: { version_id?: number; updated_at?: string };
};

export function useSpeciesRules(baseUrl = '/api/v1') {
  const loading = ref(false)
  const error = ref<string| null>(null)
  const etag  = ref<string| null>(null)

  async function fetchSpeciesList(): Promise<string[]> {
    const res = await fetch(`${baseUrl}/species`)
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    return res.json()
  }

  async function fetchRules(code: string, zone: string, onDate?: string): Promise<RulesSnapshot> {
    if (!zone) throw new Error('zone required')
    loading.value = true
    error.value = null
    try {
      const u = new URL(`${baseUrl}/species/${encodeURIComponent(code)}`, window.location.origin)
      u.searchParams.set('zone', zone)
      if (onDate) u.searchParams.set('onDate', onDate)

      const res = await fetch(u.toString(), {
        headers: etag.value ? { 'If-None-Match': etag.value } : {}
      })

      if (res.status === 304 && etag.value) {
        // Optional: 304 branch if you implement client cache; for now just refetch without cache.
        throw new Error('Not Modified (client cache not implemented)')
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 400 && body?.requires_zone) {
          throw new Error('Please select a zone.')
        }
        throw new Error(body?.error || `Request failed: ${res.status}`)
      }

      etag.value = res.headers.get('ETag') // server exposes ETag via CORS
      const json = await res.json()
      return json as RulesSnapshot
    } finally {
      loading.value = false
    }
  }

  return { loading, error, etag, fetchSpeciesList, fetchRules }
}