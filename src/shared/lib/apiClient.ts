/**
 * Centralised API client.
 * All features should call `api.get / api.post / api.put / api.delete`
 * instead of hard-coding fetch + base-URL everywhere.
 */

const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api`;

// ─── Token helpers ────────────────────────────────────────────────────────────

const getToken = (): string | null => localStorage.getItem('ecosync_token');

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  authRequired = false
): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (authRequired) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(err.message ?? 'Request failed'), {
      status: res.status,
      data: err,
    });
  }

  return res.json() as T;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get:    <T = unknown>(path: string, auth = false)                  => request<T>('GET',    path, undefined, auth),
  post:   <T = unknown>(path: string, body: unknown, auth = false)   => request<T>('POST',   path, body,      auth),
  put:    <T = unknown>(path: string, body: unknown, auth = false)   => request<T>('PUT',    path, body,      auth),
  delete: <T = unknown>(path: string, body?: unknown, auth = false)  => request<T>('DELETE', path, body,      auth),
};
