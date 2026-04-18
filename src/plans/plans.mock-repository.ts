// ─── Mock Repository ──────────────────────────────────────────────────────────
// Implements IPlansRepository using hardcoded data that mirrors backend shapes.
// Replace with PlansApiRepository (calls /api/plans) when backend is ready.
// All values come from the backend in production — nothing is hardcoded in
// components. The adapter ensures a clean domain boundary.

import type { IPlansRepository } from './plans.repository';
import type { Plan, PlanId, RawPlan } from './plans.types';
import { adaptPlan } from './plans.adapter';

const MOCK_RAW_PLANS: RawPlan[] = [
  {
    id: 'trial',
    name: 'Trial',
    tagline: 'Experimente sem compromisso',
    price_cents: 0,
    billing: 'monthly',
    limits: {
      properties: 5,
      candidates_per_property: 15,
      agents: 2,
      trial_days: 30,
    },
    features: [
      'Até 5 imóveis ativos',
      'Até 15 candidatos/mês por imóvel',
      'Até 2 agentes',
      'Score automático de candidatos',
      'Triagem e qualificação',
      'Página pública de candidatura',
      'Agendamento manual de visitas',
    ],
    highlighted: false,
    badge: '1 mês grátis',
    cta: 'Começar trial',
  },
  {
    id: 'basic',
    name: 'Básico',
    tagline: 'Para imobiliárias em crescimento',
    price_cents: 5700,
    billing: 'monthly',
    limits: {
      properties: 10,
      candidates_per_property: 25,
      agents: 4,
      trial_days: null,
    },
    features: [
      'Até 10 imóveis ativos',
      'Até 25 candidatos/mês por imóvel',
      'Até 4 agentes',
      'Score automático + classificação',
      'Triagem e qualificação',
      'Filtros avançados de leads',
      'Página pública de candidatura',
      'Agendamento manual de visitas',
    ],
    highlighted: false,
    badge: null,
    cta: 'Escolher Básico',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para equipas com volume',
    price_cents: 9700,
    billing: 'monthly',
    limits: {
      properties: 100,
      candidates_per_property: null,
      agents: 10,
      trial_days: null,
    },
    features: [
      'Até 100 imóveis ativos',
      'Candidatos ilimitados',
      'Até 10 agentes',
      'Score detalhado (4 dimensões)',
      'Insights por candidato',
      'Priorização inteligente',
      'Magic link + auto-agendamento',
      'Métricas de performance por agente',
      'Analytics completo',
    ],
    highlighted: true,
    badge: 'Mais popular',
    cta: 'Escolher Pro',
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Para grandes operações',
    price_cents: null,
    billing: 'contact',
    limits: {
      properties: null,
      candidates_per_property: null,
      agents: null,
      trial_days: null,
    },
    features: [
      'Imóveis e agentes ilimitados',
      'Candidatos ilimitados',
      'Tudo do plano Pro',
      'SLA dedicado',
      'Onboarding personalizado',
    ],
    highlighted: false,
    badge: null,
    cta: 'Falar com a equipa',
  },
];

class PlansMockRepository implements IPlansRepository {
  async fetchAll(): Promise<Plan[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_RAW_PLANS.map(adaptPlan);
  }

  async fetchById(id: PlanId): Promise<Plan | null> {
    await new Promise((r) => setTimeout(r, 150));
    const raw = MOCK_RAW_PLANS.find((p) => p.id === id) ?? null;
    return raw ? adaptPlan(raw) : null;
  }
}

// Singleton — swap this reference for the real repository with no other changes
export const plansRepository: IPlansRepository = new PlansMockRepository();
