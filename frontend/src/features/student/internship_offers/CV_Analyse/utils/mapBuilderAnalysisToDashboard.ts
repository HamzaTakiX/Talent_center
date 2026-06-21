import type {
  AnalysisLocale,
  BuilderAnalysisSlice,
  MultilingualBuilderAnalysis,
} from '../../../../cv/types/cvAiAnalysis';
import { CV_ANALYSIS_DASHBOARD_MOCK } from '../data/cvAnalysisDashboardMock';
import type { CvAnalysisDashboardData, CvAnalysisInsightsGroup, AnalysisInsightCategory } from '../types/cvAnalysisDashboard';
import {
  computeProfileCompletion,
  extractDetectedSkills,
  getAvatarInitials,
  getCvDisplayName,
  getCvFileLabel,
  type CvBuilderSnapshot,
} from './cvDraftReader';

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

export function mapBuilderAnalysisToDashboard(
  cv: CvBuilderSnapshot,
  analysis: MultilingualBuilderAnalysis,
  language: string,
  options?: { cvFileName?: string; cvSource?: 'builder' | 'imported' },
): CvAnalysisDashboardData {
  const locale = resolveLocale(language);
  const slice =
    analysis.localized[locale] ??
    analysis.localized.fr ??
    analysis.localized.en ??
    Object.values(analysis.localized)[0];

  const { overview } = slice;
  const overall = parseScore(overview.overall_score, 75);
  const ats = parseScore(overview.ats_score, 70);
  const readiness = parseScore(overview.internship_readiness, 75);
  const skillsScore = sectionScore(slice, 'skills', overall);
  const experienceScore = sectionScore(slice, 'experience', overall);
  const educationScore = sectionScore(slice, 'education', overall);
  const formattingScore = sectionScore(slice, 'profile_summary', overall - 5);

  const role = typeof cv.details.role === 'string' ? cv.details.role.trim() : '';

  return {
    ...CV_ANALYSIS_DASHBOARD_MOCK,
    profile: {
      name: getCvDisplayName(cv),
      program: role || CV_ANALYSIS_DASHBOARD_MOCK.profile.program,
      avatarInitials: getAvatarInitials(cv),
      profileCompletion: computeProfileCompletion(cv),
    },
    meta: {
      overallScore: overall,
      potentialScore: Math.min(100, overall + Math.max(4, Math.round((100 - overall) * 0.45))),
      lastAnalyzed: formatAnalysisDate(),
      analysisVersion: analysis.provider || 'v2',
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
    detectedSkills: extractDetectedSkills(cv).length
      ? extractDetectedSkills(cv)
      : CV_ANALYSIS_DASHBOARD_MOCK.detectedSkills,
    cvFileName: options?.cvFileName ?? getCvFileLabel(cv),
    cvSource: options?.cvSource ?? 'builder',
    isDefaultCv: options?.cvSource !== 'imported',
  };
}

export function buildFallbackDashboard(
  cv: CvBuilderSnapshot,
  options?: { cvFileName?: string; cvSource?: 'builder' | 'imported' },
): CvAnalysisDashboardData {
  const role = typeof cv.details.role === 'string' ? cv.details.role.trim() : '';

  return {
    ...CV_ANALYSIS_DASHBOARD_MOCK,
    profile: {
      name: getCvDisplayName(cv),
      program: role || CV_ANALYSIS_DASHBOARD_MOCK.profile.program,
      avatarInitials: getAvatarInitials(cv),
      profileCompletion: computeProfileCompletion(cv),
    },
    meta: {
      ...CV_ANALYSIS_DASHBOARD_MOCK.meta,
      lastAnalyzed: formatAnalysisDate(),
    },
    detectedSkills: extractDetectedSkills(cv).length
      ? extractDetectedSkills(cv)
      : CV_ANALYSIS_DASHBOARD_MOCK.detectedSkills,
    cvFileName: options?.cvFileName ?? getCvFileLabel(cv),
    cvSource: options?.cvSource ?? 'builder',
    isDefaultCv: options?.cvSource !== 'imported',
  };
}
