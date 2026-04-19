// ─── Mock Repository ──────────────────────────────────────────────────────────
// Persists onboarding state to localStorage to survive page refreshes.
// Replace with OnboardingApiRepository (POST /api/onboarding) for production.

import type { IOnboardingRepository } from './onboarding.repository';
import type { OnboardingState, OnboardingSubmission } from './onboarding.types';

const STORAGE_KEY = 'vyllad_onboarding';

class OnboardingMockRepository implements IOnboardingRepository {
  async getStatus(): Promise<OnboardingState> {
    await new Promise((r) => setTimeout(r, 100));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OnboardingState;
    return {
      step: 'plan',
      selectedPlanId: null,
      agency: { name: '', county: '', district: '' },
      completed: false,
    };
  }

  async complete(submission: OnboardingSubmission): Promise<{ redirectedToStripe: boolean }> {
    await new Promise((r) => setTimeout(r, 500));
    const state: OnboardingState = {
      step: 'confirm',
      selectedPlanId: submission.planId,
      agency: submission.agency,
      completed: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { redirectedToStripe: false };
  }
}

// Singleton — swap this reference for the real repository with no other changes
export const onboardingRepository: IOnboardingRepository = new OnboardingMockRepository();

/** Helper: synchronous check (reads localStorage directly) for route guards */
export function isOnboardingComplete(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as OnboardingState).completed === true;
  } catch {
    return false;
  }
}
