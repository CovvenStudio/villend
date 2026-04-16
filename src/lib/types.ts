export interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  sourceUrl: string;
  agencyId: string;
  criteria: PropertyCriteria;
  availableSlots: TimeSlot[];
  createdAt: string;
}

export interface PropertyCriteria {
  minIncome: number;
  maxPeople: number;
  petsAllowed: boolean;
  advanceMonths: number;
  depositMonths: number;
  guarantorRequired: boolean;
  advanceWithoutGuarantor?: number;
  depositWithoutGuarantor?: number;
}

export interface Candidate {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  monthlyIncome: number;
  numberOfPeople: number;
  hasPets: boolean;
  petDetails?: string;
  hasGuarantor: boolean;
  employmentType: 'permanent' | 'contract' | 'freelancer' | 'student' | 'retired' | 'other';
  employmentDuration: number; // months
  score: number;
  classification: 'excellent' | 'potential' | 'low';
  status: 'new' | 'approved' | 'rejected' | 'visit_scheduled';
  scheduledVisit?: string;
  createdAt: string;
  notes?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface Agency {
  id: string;
  name: string;
  email: string;
  logo?: string;
}

export function calculateScore(candidate: Omit<Candidate, 'score' | 'classification' | 'id' | 'status' | 'createdAt'>, criteria: PropertyCriteria, price: number): { score: number; classification: Candidate['classification'] } {
  let score = 0;

  // Income ratio (40 points max)
  const incomeRatio = candidate.monthlyIncome / price;
  if (incomeRatio >= 3) score += 40;
  else if (incomeRatio >= 2.5) score += 32;
  else if (incomeRatio >= 2) score += 24;
  else if (incomeRatio >= 1.5) score += 12;
  else score += 0;

  // People fit (15 points max)
  if (candidate.numberOfPeople <= criteria.maxPeople) score += 15;
  else if (candidate.numberOfPeople === criteria.maxPeople + 1) score += 5;

  // Pets (10 points)
  if (!candidate.hasPets || criteria.petsAllowed) score += 10;

  // Guarantor (15 points)
  if (criteria.guarantorRequired && candidate.hasGuarantor) score += 15;
  else if (!criteria.guarantorRequired) score += 15;
  else score += 0;

  // Employment stability (20 points)
  const empScores: Record<string, number> = {
    permanent: 20,
    retired: 18,
    contract: 14,
    freelancer: 10,
    student: 6,
    other: 4,
  };
  score += empScores[candidate.employmentType] || 4;

  // Duration bonus
  if (candidate.employmentDuration >= 24) score += 0; // already counted
  else if (candidate.employmentDuration >= 12) score -= 2;
  else score -= 5;

  score = Math.max(0, Math.min(100, score));

  let classification: Candidate['classification'];
  if (score >= 70) classification = 'excellent';
  else if (score >= 45) classification = 'potential';
  else classification = 'low';

  return { score, classification };
}
