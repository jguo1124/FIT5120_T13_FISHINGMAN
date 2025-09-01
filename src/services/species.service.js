import { api } from '@/lib/api'

export async function fetchSpecies(params = {}) {
  const { data } = await api.get('/api/species', { params })
  return data
}