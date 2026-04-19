// ─── Auth API ─────────────────────────────────────────────────────────────────
// Thin wrapper over the /api/auth endpoints.

import { apiFetch, tokenStore } from './api-client';

// ── Shape returned by POST /auth/google and GET /auth/me ──────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  planId: string | null;
  trialRequestedAt: string | null;
  trialAllowedAt: string | null;
}

export interface AuthMembership {
  id: string;
  agencyId: string;
  agencyName: string;
  agencySlug: string;
  role: 'OWNER' | 'MANAGER' | 'AGENT';
}

export interface AuthSession {
  user: AuthUser;
  memberships: AuthMembership[];
  accessToken: string;
  refreshToken: string;
  needsOnboarding: boolean;
}

export interface MeResponse {
  user: AuthUser;
  memberships: AuthMembership[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function signInWithGoogle(googleAccessToken: string): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ accessToken: googleAccessToken }),
  });
}

export async function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me');
}

export async function requestTrial(): Promise<void> {
  await apiFetch('/users/me/request-trial', { method: 'POST' });
}

export async function logoutApi(): Promise<void> {
  const refreshToken = localStorage.getItem('vyllad_refresh_token');
  if (!refreshToken) return;
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Ignore errors on logout
  }
}

// ── Session persistence helpers ───────────────────────────────────────────────

export function persistSession(session: AuthSession) {
  tokenStore.set(session.accessToken);
  localStorage.setItem('vyllad_refresh_token', session.refreshToken);
}

export function clearSession() {
  tokenStore.clear();
  localStorage.removeItem('vyllad_refresh_token');
}

export function hasPersistedSession(): boolean {
  return !!localStorage.getItem('vyllad_refresh_token');
}
