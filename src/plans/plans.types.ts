// ─── Domain Types ─────────────────────────────────────────────────────────────
// These are the clean, frontend-facing shapes used by all components and hooks.
// The adapter layer is responsible for mapping raw API payloads to these types.

export type PlanId = 'trial' | 'basic' | 'pro' | 'scale';
export type BillingType = 'monthly' | 'contact';

export interface PlanLimits {
  /** Max active properties. null = unlimited */
  properties: number | null;
  /** Max candidates per property per month. null = unlimited */
  candidatesPerProperty: number | null;
  /** Max agents on the account. null = unlimited */
  agents: number | null;
  /** Trial duration in days. null = not a trial plan */
  trialDays: number | null;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price in euros. null = contact sales */
  price: number | null;
  billing: BillingType;
  limits: PlanLimits;
  /** Marketing feature list for the pricing card */
  features: string[];
  /** Whether this plan is visually highlighted (e.g. "Mais popular") */
  highlighted: boolean;
  /** Optional badge text shown on the card */
  badge: string | null;
  /** CTA button label */
  cta: string;
}

// ─── Raw API Shape ─────────────────────────────────────────────────────────────
// Mirrors the JSON the backend will return (snake_case, price in cents).
// The adapter converts this to Plan.

export interface RawPlanLimits {
  properties: number | null;
  candidates_per_property: number | null;
  agents: number | null;
  trial_days: number | null;
}

export interface RawPlan {
  id: string;
  name: string;
  tagline: string;
  /** Price in euro-cents so integers carry over the wire without float issues */
  price_cents: number | null;
  billing: string;
  limits: RawPlanLimits;
  features: string[];
  highlighted: boolean;
  badge: string | null;
  cta: string;
}
