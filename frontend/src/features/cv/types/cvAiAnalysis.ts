export type AiBadgeSeverity = 'success' | 'warning' | 'info';

export interface AiSectionBadge {
  severity: AiBadgeSeverity;
  message: string;
  detail?: string;
}

export interface AiSectionInsight {
  section_id: string;
  section_score?: number;
  badges: AiSectionBadge[];
}

export interface AiOverview {
  overall_score: number;
  ats_score: number;
  strongest_section: string;
  weakest_section: string;
  internship_readiness: string;
  recruiter_attractiveness: string;
  missing_sections: string[];
  keyword_coverage: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export type AnalysisLocale = 'fr' | 'en' | 'ar';

export interface BuilderAnalysisSlice {
  overview: AiOverview;
  sections: AiSectionInsight[];
}

export interface BuilderAnalysisResult extends BuilderAnalysisSlice {
  provider: string;
}

export interface MultilingualBuilderAnalysis {
  provider: string;
  localized: Record<AnalysisLocale, BuilderAnalysisSlice>;
  raw?: Record<string, unknown>;
}

export interface ValidationIssue {
  code: string;
  section: string;
  severity: string;
  message_key: string;
}
