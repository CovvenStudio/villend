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
  /** Nome do país */
  country?: string;
  /** Sigla do país (ex: PT, BR) */
  countryCode?: string;
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
  /** MongoDB ObjectId of the selected plan — used for the real API call */
  backendPlanId?: string;
  agency: AgencySetup;
  /** Market code from BillingCountry (e.g. "EUROPE", "BR") */
  billingMarket?: string;
  /** Currency from BillingCountry (e.g. "EUR", "BRL") */
  billingCurrency?: string;
  /** Nome do país */
  country?: string;
  /** Sigla do país (ex: PT, BR) */
  countryCode?: string;
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
