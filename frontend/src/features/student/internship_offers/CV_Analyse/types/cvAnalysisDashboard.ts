export type CvScoreTone = 'low' | 'medium' | 'high';

export type RecommendationPriority = 'high' | 'medium' | 'low';

export type SkillPriority = 'high' | 'medium' | 'optional';

export type AnalysisInsightCategory = 'strengths' | 'weaknesses' | 'opportunities' | 'risks';

export type DashboardViewState = 'loading' | 'empty' | 'success' | 'error';

export type CvAnalysisNavSection =
  | 'upload'
  | 'analysis'
  | 'compatibility'
  | 'recommendations'
  | 'skills'
  | 'ai-suggestions'
  | 'interview'
  | 'history';

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
  title: string;
  location: string;
  matchPercent: number;
  breakdown: {
    skills: number;
    location: number;
    experience: number;
    education: number;
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
}

export interface CvRoadmapStep {
  id: string;
  step: number;
  titleKey: string;
  completed: boolean;
}

export interface CvInterviewSuggestion {
  id: string;
  titleKey: string;
  type: string;
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
}
