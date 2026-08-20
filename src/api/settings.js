import { apiClient } from './client'

export async function getSettings() {
  return apiClient.get('/api/settings')
}

export async function updateSettings(settings) {
  return apiClient.put('/api/settings', settings)
}
