// ─── Adapter ──────────────────────────────────────────────────────────────────
// Pure mapping of raw API payload → domain OnboardingState.

import type { OnboardingState, RawOnboardingStatus } from './onboarding.types';
import type { PlanId } from '@/plans';

export function adaptOnboardingStatus(raw: RawOnboardingStatus): OnboardingState {
  return {
    step: 'plan',
    selectedPlanId: (raw.plan_id as PlanId) ?? null,
    agency: raw.agency ?? { name: '', county: '', district: '' },
    completed: raw.completed,
  };
}
