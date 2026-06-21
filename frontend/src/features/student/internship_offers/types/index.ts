import type { LucideIcon } from 'lucide-react';

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
  responsibilities: string[];
  requiredProfile: string[];
  requiredSkills: InternshipOfferSkillTag[];
  aiMatchSummary: string;
  matchingSkills: InternshipOfferStrengthItem[];
  relevantExperience: string[];
  skillsToDevelop: InternshipOfferGrowthItem[];
  aiRecommendations: string[];
  matchReasons?: string[];
}

export type InternshipOffersStatIconMap = Record<InternshipOffersStatIconKey, LucideIcon>;

export type InternshipOffersStatColorMap = Record<InternshipOffersStatIconKey, string>;
