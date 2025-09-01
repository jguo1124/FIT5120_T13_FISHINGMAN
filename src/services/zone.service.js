import { api } from '@/lib/api'

export async function fetchZones() {
  const { data } = await api.get('/api/zones')
  return data
}