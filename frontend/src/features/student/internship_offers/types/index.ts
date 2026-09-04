import type { LucideIcon } from 'lucide-react';
import type { OfferApplicationMethod } from '../helpers/offerApplyAction';

export type InternshipOffersStatIconKey = 'applications' | 'pending' | 'accepted' | 'rejected';

export interface InternshipOffersStatItem {
  label: string;
  value: string;
  iconKey: InternshipOffersStatIconKey;
}

export type InternshipOfferCategory =
  | 'Marketing'
  | 'Business'
  | 'Finance'
  | 'HR'
  | 'Consulting';

export interface InternshipOffer {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string | null;
  location: string;
  tags: string[];
  matchPercent: number;
  category: InternshipOfferCategory;
  publishedAt?: string | null;
  isRemote?: boolean;
  distanceKm?: number | null;
  /** Motifs du moteur de recommandation (pourquoi cette offre). */
  matchReasons?: string[];
}

export type InternshipOfferSkillVariant = 'primary' | 'neutral';

export interface InternshipOfferSkillTag {
  label: string;
  variant: InternshipOfferSkillVariant;
}

export interface InternshipOfferStrengthItem {
  label: string;
  description: string;
}

export interface InternshipOfferGrowthItem {
  label: string;
  description: string;
}

/** Données complètes d’une offre — prêtes pour remplacement API. */
export interface InternshipOfferDetails extends InternshipOffer {
  description: string;
  requirements: string;
  benefits: string;
  learningOpportunities: string;
  responsibilities: string[];
  requiredProfile: string[];
  preferredSkills: string[];
  languages: string[];
  requiredSkills: InternshipOfferSkillTag[];
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  workMode?: 'remote' | 'hybrid' | 'onsite' | null;
  internshipType?: string;
  compensation?: string;
  durationMonths?: number | null;
  minEducationLevel?: string;
  externalUrl?: string;
  applicationMethod?: OfferApplicationMethod;
  aiMatchSummary: string;
  matchingSkills: InternshipOfferStrengthItem[];
  relevantExperience: string[];
  skillsToDevelop: InternshipOfferGrowthItem[];
  aiRecommendations: string[];
  matchReasons?: string[];
}

export type InternshipOffersStatIconMap = Record<InternshipOffersStatIconKey, LucideIcon>;

export type InternshipOffersStatColorMap = Record<InternshipOffersStatIconKey, string>;
