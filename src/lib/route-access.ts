export type MembershipRole = 'OWNER' | 'MANAGER' | 'AGENT';

export type FeatureGate = {
  isEnabled: (key: string) => boolean;
};

/**
 * Returns the first logged-area route that is currently accessible
 * based on global feature flags and agency role.
 */
export function resolveFirstAccessibleLoggedRoute(
  role: MembershipRole,
  gate: FeatureGate,
): string | null {
  const candidates: Array<{ path: string; allowed: boolean }> = [
    { path: '/dashboard', allowed: gate.isEnabled('dashboard.module_enabled') },
    { path: '/properties', allowed: gate.isEnabled('properties.module_enabled') },
    { path: '/appointments', allowed: gate.isEnabled('appointments.module_enabled') },
    { path: '/agents', allowed: gate.isEnabled('agents.management_enabled') },
    { path: '/screening', allowed: gate.isEnabled('screening.module_enabled') },
    { path: '/scoring', allowed: (role === 'OWNER' || role === 'MANAGER') && gate.isEnabled('scoring.module_enabled') },
    { path: '/settings', allowed: (role === 'OWNER' || role === 'MANAGER') && gate.isEnabled('settings.module_enabled') },
    { path: '/billing', allowed: role === 'OWNER' && gate.isEnabled('billing.module_enabled') },
  ];

  return candidates.find((c) => c.allowed)?.path ?? null;
}
