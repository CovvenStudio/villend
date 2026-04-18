// ─── usePlans hook ────────────────────────────────────────────────────────────
// Components never import the repository directly — only this hook.
// This is the single swap point: change plansRepository to the real one.

import { useEffect, useState } from 'react';
import type { Plan } from './plans.types';
import { plansRepository } from './plans.mock-repository';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    plansRepository
      .fetchAll()
      .then(setPlans)
      .catch(() => setError('Não foi possível carregar os planos.'))
      .finally(() => setLoading(false));
  }, []);

  return { plans, loading, error };
}
