export type CvScoreTone = 'low' | 'medium' | 'high';

export type RecommendationPriority = 'high' | 'medium' | 'low';

export type SkillPriority = 'high' | 'medium' | 'optional';

export type AnalysisInsightCategory = 'strengths' | 'weaknesses' | 'opportunities' | 'risks';

export type DashboardViewState = 'loading' | 'empty' | 'success' | 'error' | 'analyzing';

export type CvAnalysisStatus = 'none' | 'up_to_date' | 'outdated' | 'processing' | 'failed';

export type CvAnalysisNavSection =
  | 'upload'
  | 'analysis'
  | 'compatibility'
  | 'recommendations'
  | 'skills'
  | 'ai-suggestions'
  | 'interview';

export interface CvAnalysisStudentProfile {
  name: string;
  program: string;
  avatarInitials: string;
  avatarUrl?: string;
  profileCompletion: number;
}

export interface CvAnalysisMeta {
  overallScore: number;
  potentialScore: number;
  lastAnalyzed: string;
  analysisVersion: string;
  cvVersion?: string;
  cvHash?: string;
  analysisStatus?: CvAnalysisStatus;
  provider?: string;
  reportUuid?: string;
}

export interface CvBreakdownScore {
  id: string;
  labelKey: string;
  score: number;
  maxScore?: number;
}

export interface CvAnalysisInsight {
  id: string;
  text: string;
}

export interface CvAnalysisInsightsGroup {
  category: AnalysisInsightCategory;
  items: CvAnalysisInsight[];
}

export interface CvSkillTag {
  id: string;
  name: string;
  priority?: SkillPriority;
}

export interface CvInternshipMatch {
  id: string;
  company: string;
  companyInitials: string;
  companyLogoUrl?: string | null;
  title: string;
  location: string;
  matchPercent: number;
  matchLevel?: 'strong' | 'partial' | 'weak' | 'none';
  isRecommended?: boolean;
  explanation?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  breakdown: {
    skills: number;
    location: number;
    experience: number;
    education: number;
    domain?: number;
    languages?: number;
  };
}

export interface CvRecommendation {
  id: string;
  titleKey: string;
  descriptionKey: string;
  priority: RecommendationPriority;
  impactLevel: number;
  scoreGain: number;
  actionKey: string;
  isDynamic?: boolean;
}

export interface CvRoadmapStep {
  id: string;
  step: number;
  titleKey: string;
  description?: string;
  completed: boolean;
  scoreGain?: number;
  actionKey?: string;
  impact?: RecommendationPriority;
  isDynamic?: boolean;
}

export interface CvInterviewSuggestion {
  id: string;
  titleKey: string;
  type: string;
  reason?: string;
  priority?: string;
  offerId?: string;
  simulatorPath?: string;
}

export interface CvCareerMetric {
  id: string;
  labelKey: string;
  value: number;
  trend: number[];
  unit?: string;
}

export interface CvActivityEvent {
  id: string;
  type: 'upload' | 'analyze' | 'view' | 'interview';
  titleKey: string;
  timestamp: string;
}

export interface CvProfileIntelligence {
  engagementScore: number;
  riskScore: number;
  activityLevel: string;
  status: string;
  riskLabel: string;
}

export type CvAnalysisSource = 'builder' | 'imported';

export interface ImportedCvPreview {
  fileName: string;
  mimeType: string;
  kind: 'pdf' | 'docx' | 'doc' | 'unsupported';
  objectUrl?: string;
  htmlContent?: string;
}

export interface CvAnalysisDashboardData {
  profile: CvAnalysisStudentProfile;
  meta: CvAnalysisMeta;
  breakdown: CvBreakdownScore[];
  insights: CvAnalysisInsightsGroup[];
  detectedSkills: CvSkillTag[];
  missingSkills: CvSkillTag[];
  internshipMatches: CvInternshipMatch[];
  recommendations: CvRecommendation[];
  roadmap: CvRoadmapStep[];
  interviewSuggestions: CvInterviewSuggestion[];
  careerMetrics: CvCareerMetric[];
  activityTimeline: CvActivityEvent[];
  profileIntelligence: CvProfileIntelligence;
  cvFileName: string;
  cvSource?: CvAnalysisSource;
  isDefaultCv?: boolean;
  cvSnapshot?: import('../utils/cvDraftReader').CvBuilderSnapshot;
  cvFileUrl?: string;
  importedPreview?: ImportedCvPreview;
}
