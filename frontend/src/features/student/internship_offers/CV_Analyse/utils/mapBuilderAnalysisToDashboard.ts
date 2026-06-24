import type { User } from '../../../../auth/types';
import type {
  AnalysisLocale,
  BuilderAnalysisSlice,
  MultilingualBuilderAnalysis,
} from '../../../../cv/types/cvAiAnalysis';
import type { CvAnalysisDashboardData, CvAnalysisInsightsGroup, AnalysisInsightCategory } from '../types/cvAnalysisDashboard';
import {
  buildCvAnalysisStudentProfileFromUser,
  computeProfileCompletion,
  extractDetectedSkills,
  getAvatarInitials,
  getCvDisplayName,
  getCvFileLabel,
  type CvBuilderSnapshot,
} from './cvDraftReader';

const EMPTY_DASHBOARD_BASE: Omit<CvAnalysisDashboardData, 'profile' | 'meta' | 'cvFileName'> = {
  breakdown: [],
  insights: [],
  detectedSkills: [],
  missingSkills: [],
  internshipMatches: [],
  recommendations: [],
  roadmap: [],
  interviewSuggestions: [],
  careerMetrics: [],
  activityTimeline: [],
  profileIntelligence: {
    engagementScore: 0,
    riskScore: 0,
    activityLevel: 'low',
    status: 'pending',
    riskLabel: 'unknown',
  },
};

function resolveDashboardProfile(
  cv: CvBuilderSnapshot,
  user?: User | null,
): CvAnalysisDashboardData['profile'] {
  const userProfile = buildCvAnalysisStudentProfileFromUser(user);
  if (userProfile) return userProfile;

  const role = typeof cv.details.role === 'string' ? cv.details.role.trim() : '';
  return {
    name: getCvDisplayName(cv),
    program: role || '—',
    avatarInitials: getAvatarInitials(cv),
    profileCompletion: computeProfileCompletion(cv),
  };
}

export function applyUserProfileToDashboard(
  dashboard: CvAnalysisDashboardData,
  user?: User | null,
): CvAnalysisDashboardData {
  const userProfile = buildCvAnalysisStudentProfileFromUser(user);
  if (!userProfile) return dashboard;
  return { ...dashboard, profile: userProfile };
}

export function mergeDashboardWithCvMeta(
  dashboard: CvAnalysisDashboardData,
  cv: CvBuilderSnapshot,
  options?: { cvFileName?: string; cvSource?: 'builder' | 'imported'; user?: User | null },
): CvAnalysisDashboardData {
  const userProfile = buildCvAnalysisStudentProfileFromUser(options?.user);
  return {
    ...dashboard,
    profile: userProfile ?? dashboard.profile ?? resolveDashboardProfile(cv, options?.user),
    cvFileName: options?.cvFileName ?? dashboard.cvFileName ?? getCvFileLabel(cv),
    cvSource: options?.cvSource ?? dashboard.cvSource ?? 'builder',
    isDefaultCv: options?.cvSource !== 'imported',
    detectedSkills: dashboard.detectedSkills?.length
      ? dashboard.detectedSkills
      : extractDetectedSkills(cv),
  };
}

export function buildEmptyDashboard(
  cv: CvBuilderSnapshot,
  options?: { cvFileName?: string; cvSource?: 'builder' | 'imported'; user?: User | null },
): CvAnalysisDashboardData {
  return {
    ...EMPTY_DASHBOARD_BASE,
    profile: resolveDashboardProfile(cv, options?.user),
    meta: {
      overallScore: 0,
      potentialScore: 0,
      lastAnalyzed: new Date().toLocaleString(),
      analysisVersion: 'pending',
    },
    detectedSkills: extractDetectedSkills(cv).map((s, i) => ({ id: `s-${i}`, name: s.name })),
    cvFileName: options?.cvFileName ?? getCvFileLabel(cv),
    cvSource: options?.cvSource ?? 'builder',
    isDefaultCv: options?.cvSource !== 'imported',
  };
}

function resolveLocale(lang: string): AnalysisLocale {
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('en')) return 'en';
  return 'fr';
}

function parseScore(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) return Math.min(100, Math.max(0, parseInt(match[0], 10)));
  }
  return fallback;
}

function sectionScore(slice: BuilderAnalysisSlice, sectionId: string, fallback: number): number {
  const found = slice.sections.find((s) => s.section_id === sectionId);
  return found?.section_score ?? fallback;
}

function formatAnalysisDate(): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function buildInsights(overview: BuilderAnalysisSlice['overview']): CvAnalysisInsightsGroup[] {
  const toItems = (texts: string[], prefix: string) =>
    texts
      .filter((t) => t.trim())
      .slice(0, 4)
      .map((text, i) => ({ id: `${prefix}-${i}`, text }));

  const opportunities = overview.recommendations.slice(0, 3);
  const risks = overview.missing_sections.map((s) => `Section manquante : ${s}`);

  return [
    { category: 'strengths' as AnalysisInsightCategory, items: toItems(overview.strengths, 's') },
    { category: 'weaknesses' as AnalysisInsightCategory, items: toItems(overview.weaknesses, 'w') },
    { category: 'opportunities' as AnalysisInsightCategory, items: toItems(opportunities, 'o') },
    { category: 'risks' as AnalysisInsightCategory, items: toItems(risks.length ? risks : overview.weaknesses.slice(0, 2), 'r') },
  ].filter((g) => g.items.length > 0);
}

/** Legacy mapper for builder analysis API — no mock data, real API fields only. */
export function mapBuilderAnalysisToDashboard(
  cv: CvBuilderSnapshot,
  analysis: MultilingualBuilderAnalysis,
  language: string,
  options?: { cvFileName?: string; cvSource?: 'builder' | 'imported'; user?: User | null },
): CvAnalysisDashboardData {
  const locale = resolveLocale(language);
  const slice =
    analysis.localized[locale] ??
    analysis.localized.fr ??
    analysis.localized.en ??
    Object.values(analysis.localized)[0];

  const { overview } = slice;
  const overall = parseScore(overview.overall_score, 0);
  const ats = parseScore(overview.ats_score, 0);
  const readiness = parseScore(overview.internship_readiness, 0);
  const skillsScore = sectionScore(slice, 'skills', overall);
  const experienceScore = sectionScore(slice, 'experience', overall);
  const educationScore = sectionScore(slice, 'education', overall);
  const formattingScore = sectionScore(slice, 'profile_summary', overall);

  return {
    ...EMPTY_DASHBOARD_BASE,
    profile: resolveDashboardProfile(cv, options?.user),
    meta: {
      overallScore: overall,
      potentialScore: Math.min(100, overall + Math.max(4, Math.round((100 - overall) * 0.45))),
      lastAnalyzed: formatAnalysisDate(),
      analysisVersion: analysis.provider || 'legacy',
    },
    breakdown: [
      { id: 'skills', labelKey: 'student.internshipOffers.cvDashboard.breakdown.skills', score: skillsScore },
      { id: 'experience', labelKey: 'student.internshipOffers.cvDashboard.breakdown.experience', score: experienceScore },
      { id: 'education', labelKey: 'student.internshipOffers.cvDashboard.breakdown.education', score: educationScore },
      { id: 'formatting', labelKey: 'student.internshipOffers.cvDashboard.breakdown.formatting', score: formattingScore },
      { id: 'ats', labelKey: 'student.internshipOffers.cvDashboard.breakdown.ats', score: ats },
      { id: 'readiness', labelKey: 'student.internshipOffers.cvDashboard.breakdown.readiness', score: readiness },
    ],
    insights: buildInsights(overview),
    detectedSkills: extractDetectedSkills(cv).map((s, i) => ({ id: `s-${i}`, name: s.name })),
    cvFileName: options?.cvFileName ?? getCvFileLabel(cv),
    cvSource: options?.cvSource ?? 'builder',
    isDefaultCv: options?.cvSource !== 'imported',
  };
}

export function buildFallbackDashboard(
  cv: CvBuilderSnapshot,
  options?: { cvFileName?: string; cvSource?: 'builder' | 'imported'; user?: User | null },
): CvAnalysisDashboardData {
  return buildEmptyDashboard(cv, options);
}
