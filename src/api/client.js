// Base URL is overridable via VITE_API_URL (set in .env for anything other
// than local dev — e.g. the deployed API's URL) and falls back to the local
// .NET API's default port so `npm run dev` works with no setup.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5200'

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) return null
  return response.json()
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
}
