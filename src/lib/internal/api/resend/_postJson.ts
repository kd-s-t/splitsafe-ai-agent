export async function postJson<T>(path: string, body: unknown, baseUrl?: string): Promise<T> {
  const url = baseUrl ? new URL(path, baseUrl).toString() : path
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let details: unknown
    try { details = await res.json() } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(`Request failed ${res.status}: ${res.statusText}${details ? ` - ${JSON.stringify(details)}` : ''}`)
  }
  return (await res.json()) as T
}


