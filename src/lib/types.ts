export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  agencyId: string;
  agentIds: string[];
  criteria: PropertyCriteria;
  availableSlots: TimeSlot[];
  createdAt: string;
  // Campos do cadastro
  referenceId?: string;
  announcementLink?: string;
  rentalPrice?: number;
  // Campos legados / opcionais
  price?: number;
  images?: string[];
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  sourceUrl?: string;
  floor?: number;
  hasGarage?: boolean;
  hasElevator?: boolean;
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
  employmentDuration: number;
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

export interface Agent {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  phone: string;
  picture: string;
  specialty: string;
  activeListings: number;
  conversionRate: number;
  joinedAt: string;
}

export interface Appointment {
  id: string;
  propertyId: string;
  candidateId: string;
  agentId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Agency {
  id: string;
  name: string;
  email: string;
  logo?: string;
}

export function calculateScore(candidate: Omit<Candidate, 'score' | 'classification' | 'id' | 'status' | 'createdAt'>, criteria: PropertyCriteria, price: number): { score: number; classification: Candidate['classification'] } {
  let score = 0;
  const incomeRatio = candidate.monthlyIncome / price;
  if (incomeRatio >= 3) score += 40;
  else if (incomeRatio >= 2.5) score += 32;
  else if (incomeRatio >= 2) score += 24;
  else if (incomeRatio >= 1.5) score += 12;

  if (candidate.numberOfPeople <= criteria.maxPeople) score += 15;
  else if (candidate.numberOfPeople === criteria.maxPeople + 1) score += 5;

  if (!candidate.hasPets || criteria.petsAllowed) score += 10;

  if (criteria.guarantorRequired && candidate.hasGuarantor) score += 15;
  else if (!criteria.guarantorRequired) score += 15;

  const empScores: Record<string, number> = {
    permanent: 20, retired: 18, contract: 14, freelancer: 10, student: 6, other: 4,
  };
  score += empScores[candidate.employmentType] || 4;

  if (candidate.employmentDuration >= 24) score += 0;
  else if (candidate.employmentDuration >= 12) score -= 2;
  else score -= 5;

  score = Math.max(0, Math.min(100, score));

  let classification: Candidate['classification'];
  if (score >= 70) classification = 'excellent';
  else if (score >= 45) classification = 'potential';
  else classification = 'low';

  return { score, classification };
}
