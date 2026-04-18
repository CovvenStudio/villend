// ─── Onboarding Domain Types ──────────────────────────────────────────────────
// The shapes the onboarding wizard works with internally.

import type { PlanId } from '@/plans';

export type OnboardingStep = 'plan' | 'agency' | 'confirm';

export interface AgencySetup {
  name: string;
  /** Concelho (e.g. "Lisboa") */
  county: string;
  /** Distrito (e.g. "Lisboa") */
  district: string;
}

export interface OnboardingState {
  step: OnboardingStep;
  selectedPlanId: PlanId | null;
  agency: AgencySetup;
  completed: boolean;
}

/** Payload sent to the backend (or mock) when the user confirms */
export interface OnboardingSubmission {
  agencyId: string;
  planId: PlanId;
  agency: AgencySetup;
}

// ─── Raw API Shapes ───────────────────────────────────────────────────────────
// What the backend returns when checking onboarding status.

export interface RawOnboardingStatus {
  completed: boolean;
  plan_id: string | null;
  agency: {
    name: string;
    county: string;
    district: string;
  } | null;
}
