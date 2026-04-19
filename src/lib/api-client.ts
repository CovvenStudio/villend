// ─── Base API Client ──────────────────────────────────────────────────────────
// All backend requests go through here.
// - Attaches Bearer token from the in-memory AuthStore
// - Automatically retries once on 401 by refreshing the token

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// In-memory token store (never persists accessToken to localStorage for security)
let _accessToken: string | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (t: string | null) => { _accessToken = t; },
  clear: () => { _accessToken = null; },
};

let _isRefreshing = false;
let _refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('vyllad_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      localStorage.removeItem('vyllad_refresh_token');
      tokenStore.clear();
      return false;
    }

    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    tokenStore.set(data.accessToken);
    localStorage.setItem('vyllad_refresh_token', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = tokenStore.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Attempt token refresh once
    if (!_isRefreshing) {
      _isRefreshing = true;
      _refreshPromise = doRefresh().finally(() => {
        _isRefreshing = false;
        _refreshPromise = null;
      });
    }

    const refreshed = await _refreshPromise!;
    if (!refreshed) throw new ApiError(401, 'Sessão expirada. Faça login novamente.');

    // Retry original request with new token
    const retryHeaders = { ...headers, Authorization: `Bearer ${tokenStore.get()}` };
    const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers: retryHeaders });
    if (!retry.ok) throw await buildApiError(retry);
    return retry.json() as Promise<T>;
  }

  if (!res.ok) throw await buildApiError(res);

  // Handle empty responses (204, 200 with no body)
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function buildApiError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    return new ApiError(res.status, body?.message ?? res.statusText);
  } catch {
    return new ApiError(res.status, res.statusText);
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
