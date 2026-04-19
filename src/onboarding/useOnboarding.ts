// ─── useOnboarding hook ───────────────────────────────────────────────────────
// Manages multi-step wizard state. Components import only this hook — they
// have no knowledge of the repository or storage mechanism.

import { useCallback, useState } from 'react';
import type { AgencySetup, OnboardingStep } from './onboarding.types';
import type { Plan, PlanId } from '@/plans';
import type { BillingCountry } from '@/billing-countries/useBillingCountries';
import { onboardingApiRepository } from './onboarding.api-repository';


export function useOnboarding() {
  const [step, setStep] = useState<OnboardingStep>('plan');
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [selectedBackendPlanId, setSelectedBackendPlanId] = useState<string | null>(null);
  const [billingCountry, setBillingCountry] = useState<BillingCountry | null>(null);
  const [agency, setAgencyState] = useState<AgencySetup>({
    name: '',
    county: '',
    district: '',
    country: '',
    countryCode: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const selectBillingCountry = useCallback((country: BillingCountry) => {
    setBillingCountry(country);
    setAgencyState((prev) => ({
      ...prev,
      country: country.name,
      countryCode: country.countryCode,
    }));
  }, []);

  const selectPlan = useCallback((plan: Plan) => {
    setSelectedPlanId(plan.id);
    setSelectedBackendPlanId(plan.backendPlanId);
    setStep('agency');
  }, []);

  const submitAgency = useCallback((data: AgencySetup) => {
    setAgencyState((prev) => ({
      ...prev,
      ...data,
      country: billingCountry?.name ?? prev.country,
      countryCode: billingCountry?.countryCode ?? prev.countryCode,
    }));
    setStep('confirm');
  }, [billingCountry]);

  const goBack = useCallback(() => {
    setStep((prev) => {
      if (prev === 'agency') return 'plan';
      if (prev === 'confirm') return 'agency';
      return 'plan';
    });
  }, []);

  const confirm = useCallback(async (): Promise<boolean> => {
    if (!selectedPlanId || !selectedBackendPlanId) return false;
    setSubmitting(true);
    const { redirectedToStripe } = await onboardingApiRepository.complete({
      agencyId: '',
      planId: selectedPlanId,
      backendPlanId: selectedBackendPlanId,
      agency,
      billingMarket: billingCountry?.market,
      billingCurrency: billingCountry?.currency,
      country: billingCountry?.name,
      countryCode: billingCountry?.countryCode,
    });
    // Só tira o loading se NÃO for Stripe (ou seja, trial)
    if (!redirectedToStripe) setSubmitting(false);
    return redirectedToStripe;
  }, [selectedPlanId, selectedBackendPlanId, agency, billingCountry]);

  return {
    step,
    selectedPlanId,
    agency,
    billingCountry,
    submitting,
    selectBillingCountry,
    selectPlan,
    submitAgency,
    goBack,
    confirm,
  };
}
