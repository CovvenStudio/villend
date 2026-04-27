import { apiFetch } from './api-client';

export interface FeatureFlagDto {
  key: string;
  enabled: boolean;
  reason: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export function listFeatureFlags(): Promise<FeatureFlagDto[]> {
  return apiFetch<FeatureFlagDto[]>('/feature-flags');
}

export function isFeatureEnabled(key: string, flags: FeatureFlagDto[]): boolean {
  const normalized = key.trim().toLowerCase();
  const found = flags.find((f) => f.key === normalized);
  return found?.enabled ?? true;
}
