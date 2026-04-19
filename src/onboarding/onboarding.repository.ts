// ─── Repository Interface ─────────────────────────────────────────────────────
// Components and hooks depend only on this contract.
// Swap OnboardingMockRepository for OnboardingApiRepository when backend is ready.

import type { OnboardingState, OnboardingSubmission } from './onboarding.types';

export interface IOnboardingRepository {
  /** Fetch persisted onboarding state for the current user */
  getStatus(): Promise<OnboardingState>;
  /** Persist the completed onboarding (agency creation + plan selection).
   * Returns whether the browser was redirected to Stripe checkout. */
  complete(submission: OnboardingSubmission): Promise<{ redirectedToStripe: boolean }>;
}
