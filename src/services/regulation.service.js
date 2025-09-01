import { api } from '@/lib/api'

// get effective regulation for a species+zone at a date
export async function fetchRegulations({ speciesId, zoneId, at }) {
  const { data } = await api.get('/api/regulations', {
    params: { speciesId, zoneId, at }, // ISO date string
  })
  return data
}