import type { StageOfferImportPreview } from '../../../../shared/types/stageTypes';

export type SimulatorView = 'hub' | 'config' | 'active' | 'summary' | 'loading';

export type SimulationBasis = 'personal' | 'offer';

export type InterviewFocusType = 'hr' | 'technical' | 'mixed';

export type OfferInputMode = 'url' | 'manual';

export type InterviewerGender = 'female' | 'male';

export type ExperienceLevel = 'intern' | 'junior' | 'mid' | 'senior';

export type InterviewDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type InterviewLength = 5 | 10 | 15 | 20 | 30;

export type InterviewMedium = 'text' | 'voice' | 'video';

export type InterviewLanguage = 'en' | 'fr' | 'ar';

export type InterviewModeId =
  | 'general'
  | 'role-specific'
  | 'behavioral'
  | 'technical'
  | 'hr'
  | 'custom';

export type SkillGapPriority = 'high' | 'medium' | 'low';

export interface StudentInterviewProfile {
  name: string;
  program: string;
  avatarInitials: string;
  readinessScore: number;
}

export interface InterviewMode {
  id: InterviewModeId;
  titleKey: string;
  descKey: string;
  icon: string;
  examples?: string[];
  gradient: string;
}

export interface InterviewHistoryRow {
  id: string;
  sessionUuid: string;
  date: string;
  typeKey: string;
  difficulty: InterviewDifficulty;
  score: number;
  duration: string;
  statusKey: string;
  status: string;
  roleLabel?: string;
  hasReport?: boolean;
  readinessText?: string;
}

export interface AnalyticsMetric {
  id: string;
  labelKey: string;
  values: number[];
  unit?: string;
}

export interface SimulatorConfig {
  basis?: SimulationBasis;
  interviewFocus?: InterviewFocusType;
  offerInputMode?: OfferInputMode;
  offerUrl?: string;
  offerImportJobUuid?: string;
  /** Pre-linked platform offer — skips basis / offer-data wizard steps. */
  linkedOfferId?: string;
  interviewerGender?: InterviewerGender;
  experienceLevel?: ExperienceLevel;
  modeId: InterviewModeId;
  role: string;
  difficulty: InterviewDifficulty;
  length: InterviewLength;
  medium: InterviewMedium;
  language: InterviewLanguage;
  customJobTitle?: string;
  customCompany?: string;
  customDescription?: string;
  /** Full payload returned by URL extraction — shown in the offer preview panel. */
  extractedOfferPreview?: StageOfferImportPreview;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  interviewerRole: string;
  interviewerName: string;
}

export interface LiveFeedbackCategory {
  id: string;
  labelKey: string;
  score: number;
}

export interface AnswerFeedback {
  wentWell: string[];
  needsImprovement: string[];
  suggestedAnswer: string;
  professionalExample: string;
  vocabulary: string[];
  confidenceTips: string[];
}

export interface TranscriptEntry {
  id: string;
  question: string;
  answer: string;
  feedback: string;
  score: number;
}

export interface SkillGap {
  id: string;
  name: string;
  priority: SkillGapPriority;
}

export interface RoadmapWeek {
  id: string;
  week: number;
  titleKey: string;
}

export interface SummaryBreakdown {
  id: string;
  labelKey: string;
  score: number;
}

export interface CoachSuggestion {
  id: string;
  labelKey: string;
}

export type WeakSkillTrend = 'up' | 'down' | 'flat';

export interface WeakSkillDetail {
  id: string;
  name: string;
  score: number;
  priority: SkillGapPriority;
  statusKey: string;
  trend: WeakSkillTrend;
  trendDelta: number;
  suggestionKey: string;
}
