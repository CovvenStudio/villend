// ─── Adapter ──────────────────────────────────────────────────────────────────
// Pure transformation: RawPlan (API shape) → Plan (domain type).
// No side effects, no state. Easy to unit test.

import type { Plan, PlanId, RawPlan } from './plans.types';

export function adaptPlan(raw: RawPlan): Plan {
  return {
    id: raw.id as PlanId,
    name: raw.name,
    tagline: raw.tagline,
    price: raw.price_cents !== null ? raw.price_cents / 100 : null,
    billing: raw.billing as Plan['billing'],
    limits: {
      properties: raw.limits.properties,
      candidatesPerProperty: raw.limits.candidates_per_property,
      agents: raw.limits.agents,
      trialDays: raw.limits.trial_days,
    },
    features: raw.features,
    highlighted: raw.highlighted,
    badge: raw.badge,
    cta: raw.cta,
  };
}
