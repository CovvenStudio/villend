// ─── Repository Interface ─────────────────────────────────────────────────────
// This contract is the ONLY thing components and hooks depend on.
// Swap PlansMockRepository for PlansApiRepository with zero changes elsewhere.

import type { Plan, PlanId } from './plans.types';

export interface IPlansRepository {
  fetchAll(): Promise<Plan[]>;
  fetchById(id: PlanId): Promise<Plan | null>;
}
