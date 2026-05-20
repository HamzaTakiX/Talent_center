import type { AiOverview, BuilderAnalysisResult } from '../types/cvAiAnalysis';
import { isTrivialInsight } from './insightQuality';

export type RecPriority = 'critical' | 'important' | 'optional';

export interface RecommendationItem {
  id: string;
  priority: RecPriority;
  section: string;
  message: string;
  impact: string;
}

const SECTION_LABEL_KEYS: Record<string, string> = {
  profile_summary: 'cv.forms.steps.summary',
  contact: 'cv.forms.steps.personal',
  experience: 'cv.forms.steps.experience',
  education: 'cv.forms.steps.education',
  skills: 'cv.forms.steps.skills',
  languages: 'cv.forms.steps.languages',
  projects: 'cv.forms.steps.projects',
};

export function sectionLabelKey(sectionId: string): string {
  return SECTION_LABEL_KEYS[sectionId] ?? 'cv.editor.title';
}

export function buildImprovements(
  overview: AiOverview,
  result?: BuilderAnalysisResult | null,
): RecommendationItem[] {
  const weakest = overview.weakest_section;
  const items: RecommendationItem[] = [];

  overview.weaknesses.forEach((msg, i) => {
    if (isTrivialInsight(msg)) return;
    items.push({
      id: `w-${i}`,
      priority: 'critical',
      section: weakest,
      message: msg,
      impact: 'recruiter_impact_critical',
    });
  });

  overview.recommendations.forEach((msg, i) => {
    if (isTrivialInsight(msg)) return;
    const priority: RecPriority =
      i === 0 ? 'critical' : i < 2 ? 'important' : 'optional';
    const section =
      result?.sections?.find((s) => (s.section_score ?? 100) < 58)?.section_id ?? weakest;
    items.push({
      id: `r-${i}`,
      priority,
      section,
      message: msg,
      impact:
        priority === 'critical'
          ? 'recruiter_impact_critical'
          : priority === 'important'
            ? 'recruiter_impact_important'
            : 'recruiter_impact_optional',
    });
  });

  const seen = new Set<string>();
  return items
    .filter((item) => {
      const key = item.message.slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

export function scoreTone(score: number): 'excellent' | 'good' | 'fair' | 'low' {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'fair';
  return 'low';
}
