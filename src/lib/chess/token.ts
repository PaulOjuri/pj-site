// Write-back token for the private endpoints. Lives only in this browser's localStorage.
const KEY = 'chess_token'

export function getToken(): string {
  try { return localStorage.getItem(KEY) ?? '' } catch { return '' }
}

export function setToken(t: string): void {
  try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY) } catch { /* ignore */ }
}

export async function postJson(path: string, body: unknown): Promise<{ ok: boolean; status: number }> {
  const token = getToken()
  if (!token) return { ok: false, status: 0 }
  try {
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
    return { ok: r.ok, status: r.status }
  } catch { return { ok: false, status: -1 } }
}
