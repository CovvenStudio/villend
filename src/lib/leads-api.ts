import { apiFetch, BASE_URL } from './api-client';

// ── Submit lead ───────────────────────────────────────────────────────────────

export interface SubmitLeadInput {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  income: string;
  monthlyCommitments: string;
  job: string;
  employmentDuration: string;
  hasGuarantor: string;
  household: string;
  hasPets: boolean;
  petTypes: string[];
  urgency: string;
  stayDuration: string;
  hasVisited: string;
  motivation: string;
  customAnswers: Record<string, string>;
}

export interface SubmitLeadResponse {
  id: string;
  score: number;
  factorScores: Record<string, number>;
  classification: 'excellent' | 'potential' | 'low';
}

// ── Lead list ─────────────────────────────────────────────────────────────────

export interface LeadDto {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  income: string;
  monthlyCommitments: string;
  job: string;
  employmentDuration: string;
  hasGuarantor: string;
  household: string;
  hasPets: boolean;
  petTypes: string[];
  urgency: string;
  stayDuration: string;
  hasVisited: string;
  motivation: string;
  customAnswers: Record<string, string>;
  score: number;
  factorScores: Record<string, number>;
  classification: 'excellent' | 'potential' | 'low';
  status: 'new' | 'contacted' | 'qualified' | 'rejected' | 'approved';
  createdAt: string;
}

export interface LeadListResponse {
  leads: LeadDto[];
  total: number;
}

// ── Scoring config ────────────────────────────────────────────────────────────

export interface ScoringThresholds {
  excellent: number;
  potential: number;
}

/** Per-agency configurable breakpoints for numeric scoring factors. */
export interface NumericFactorThresholds {
  /** Income-to-rent ratio breakpoints, ascending [minimum, weak, good, ideal]. Default: [1, 2, 3, 3.5] */
  incomeRatio: number[];
  /** Monthly commitments as % of income, ascending [low_max, medium_max, high_max]. Default: [20, 40, 60] */
  commitmentsPercent: number[];
}

export const DEFAULT_NUMERIC_THRESHOLDS: NumericFactorThresholds = {
  incomeRatio:        [1.0, 2.0, 3.0, 3.5],
  commitmentsPercent: [20, 40, 60],
};

export interface ScoringFactorLevelDto {
  level: number;    // 0-4
  label: string;    // "Ignorar" … "Determinante"
  weight: number;   // 0,1,2,4,8
}

export interface ScoringFactorDefinitionDto {
  key: string;
  category: string;
  categoryLabel: string;
  label: string;
  order: number;
  /** Maps each answer option value to a human-readable verdict. Empty for numeric factors. */
  optionVerdicts: Record<string, string>;
}

export interface ScoringConfigDto {
  agencyId: string;
  profileName: string;
  thresholds: ScoringThresholds;
  numericThresholds: NumericFactorThresholds;
  /** factorKey → importance level (0-4) */
  factors: Record<string, number>;
  levelDefinitions: ScoringFactorLevelDto[];
  factorDefinitions: ScoringFactorDefinitionDto[];
}

export type SaveScoringConfigInput = Omit<ScoringConfigDto, 'agencyId' | 'levelDefinitions' | 'factorDefinitions'>;

// ── API functions ─────────────────────────────────────────────────────────────

/** Public — no auth needed */
export async function submitLead(
  slug: string,
  input: SubmitLeadInput,
): Promise<SubmitLeadResponse> {
  const res = await fetch(`${BASE_URL}/public/properties/${slug}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Erro ao submeter candidatura.');
  }
  return res.json();
}

/** Authenticated */
export const listLeads = (agencyId: string, propertyId: string, skip = 0, take = 50) =>
  apiFetch<LeadListResponse>(
    `/agencies/${agencyId}/properties/${propertyId}/leads?skip=${skip}&take=${take}`,
  );

export const updateLeadStatus = (agencyId: string, id: string, status: string) =>
  apiFetch<void>(`/agencies/${agencyId}/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const getScoringConfig = (agencyId: string) =>
  apiFetch<ScoringConfigDto>(`/agencies/${agencyId}/scoring-config`);

export const saveScoringConfig = (agencyId: string, dto: SaveScoringConfigInput) =>
  apiFetch<ScoringConfigDto>(`/agencies/${agencyId}/scoring-config`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });

