// ─── useOnboarding hook ───────────────────────────────────────────────────────
// Manages multi-step wizard state. Components import only this hook — they
// have no knowledge of the repository or storage mechanism.

import { useCallback, useState } from 'react';
import type { AgencySetup, OnboardingStep } from './onboarding.types';
import type { PlanId } from '@/plans';
import { onboardingRepository } from './onboarding.mock-repository';

export function useOnboarding() {
  const [step, setStep] = useState<OnboardingStep>('plan');
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [agency, setAgencyState] = useState<AgencySetup>({
    name: '',
    county: '',
    district: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const selectPlan = useCallback((id: PlanId) => {
    setSelectedPlanId(id);
    setStep('agency');
  }, []);

  const submitAgency = useCallback((data: AgencySetup) => {
    setAgencyState(data);
    setStep('confirm');
  }, []);

  const goBack = useCallback(() => {
    setStep((prev) => {
      if (prev === 'agency') return 'plan';
      if (prev === 'confirm') return 'agency';
      return 'plan';
    });
  }, []);

  const confirm = useCallback(async (): Promise<void> => {
    if (!selectedPlanId) return;
    setSubmitting(true);
    try {
      await onboardingRepository.complete({
        agencyId: 'agency-1', // replaced by real auth context in production
        planId: selectedPlanId,
        agency,
      });
    } finally {
      setSubmitting(false);
    }
  }, [selectedPlanId, agency]);

  return {
    step,
    selectedPlanId,
    agency,
    submitting,
    selectPlan,
    submitAgency,
    goBack,
    confirm,
  };
}
