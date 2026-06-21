export type CreationMethod = 'manual' | 'import' | null;

export type WorkMode = string;

export type ApplicationMethod = 'internal' | 'external' | 'email';

export type Visibility = 'public' | 'targeted' | 'private';

export type WizardStep =
  | 'basic'
  | 'description'
  | 'skills'
  | 'targeting'
  | 'recruitment'
  | 'review';

export interface DescriptionSections {
  overview: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  learningOpportunities: string;
}

export interface TargetingRules {
  programs: string[];
  classes: string[];
  levels: string[];
  departments: string[];
  categories: string[];
  internshipTypes: string[];
}

export interface RecruitmentSettings {
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  profilesNeeded: number;
  visibility: Visibility;
  autoExpiration: boolean;
  applicationMethod: ApplicationMethod;
  externalUrl: string;
  submissionEmail: string;
}

export interface CreateOfferFormState {
  title: string;
  company: string;
  internshipType: string;
  location: string;
  workMode: WorkMode;
  department: string;
  positions: number;
  description: DescriptionSections;
  requiredSkills: string[];
  preferredSkills: string[];
  languages: string[];
  softSkills: string[];
  yearsExperience: string;
  certifications: string[];
  targeting: TargetingRules;
  recruitment: RecruitmentSettings;
}

export interface SuggestedStudent {
  id: string;
  name: string;
  matchPercent: number;
  program: string;
  level: string;
  skills: string[];
}

export interface DuplicateOffer {
  id: string;
  title: string;
  company: string;
  similarity: number;
  publishedDaysAgo: number;
}

export interface SmartInsight {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
}

export interface AnalyticsPreview {
  expectedReach: number | null;
  targetStudents: number | null;
  predictedApplications: number | null;
  visibilityScore: number;
  completenessScore: number;
}

export type ImportPhase = 'idle' | 'analyzing' | 'extracted' | 'failed';

export interface ImportJobMeta {
  jobUuid: string | null;
  detectedPlatform: string;
  parserUsed: string;
  sourceUrl: string;
  importDate: string;
  companyLogoUrl: string;
}

export interface ExtractedOfferData {
  company: string;
  title: string;
  location: string;
  skills: string[];
  description: string;
  requirements: string;
  benefits: string;
}

export const EMPTY_DESCRIPTION: DescriptionSections = {
  overview: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  learningOpportunities: '',
};

export const EMPTY_TARGETING: TargetingRules = {
  programs: [],
  classes: [],
  levels: [],
  departments: [],
  categories: [],
  internshipTypes: [],
};

export const EMPTY_RECRUITMENT: RecruitmentSettings = {
  applicationDeadline: '',
  startDate: '',
  endDate: '',
  profilesNeeded: 1,
  visibility: 'targeted',
  autoExpiration: true,
  applicationMethod: 'internal',
  externalUrl: '',
  submissionEmail: '',
};

export function createEmptyOfferForm(): CreateOfferFormState {
  return {
    title: '',
    company: '',
    internshipType: '',
    location: '',
    workMode: 'onsite',
    department: '',
    positions: 1,
    description: { ...EMPTY_DESCRIPTION },
    requiredSkills: [],
    preferredSkills: [],
    languages: [],
    softSkills: [],
    yearsExperience: '',
    certifications: [],
    targeting: { ...EMPTY_TARGETING },
    recruitment: { ...EMPTY_RECRUITMENT },
  };
}
