import type { AiSectionBadge, BuilderAnalysisResult } from '../types/cvAiAnalysis';

export const PREVIEW_ANNOTATED_SECTIONS = new Set([
  'profile_summary',
  'experience',
  'education',
  'skills',
  'languages',
  'projects',
]);

const TRIVIAL_PATTERNS: RegExp[] = [
  /\bemail\b.*\b(listed|visible|present|added|exists?)\b/i,
  /\bphone\b.*\b(visible|listed|present|added|number)\b/i,
  /\b(name|title)\b.*\b(present|readable|added|exists?|visible)\b/i,
  /\blinkedin\b.*\b(exists?|listed|strengthens trust)\b/i,
  /\bcontact\b.*\b(listed|visible)\b/i,
  /\b\d+\s+experience entries add credibility\b/i,
  /\beducation section establishes academic foundation\b/i,
  /\blanguage\(s\) listed\b/i,
  /\bprojects demonstrate applied\b/i,
  /\bgood skills breadth for ats parsing\b/i,
  /\bprofessional title is present\b/i,
  /\bquantified achievements\b/i,
  /\bmeasurable impact\b/i,
  /\bmirror .+ internship keywords\b/i,
  /\bkeyword alignment\b/i,
  /\bdenser in summary and skills\b/i,
];

export function isTrivialInsight(message: string): boolean {
  const m = message.trim();
  if (!m || m.length < 12) return true;
  return TRIVIAL_PATTERNS.some((re) => re.test(m));
}

function badgePriority(severity: string): number {
  if (severity === 'warning') return 0;
  if (severity === 'success') return 1;
  return 2;
}

export function filterMeaningfulBadges(badges: AiSectionBadge[]): AiSectionBadge[] {
  return badges
    .filter((b) => b.message && !isTrivialInsight(b.message))
    .sort((a, b) => badgePriority(a.severity) - badgePriority(b.severity));
}

export function getPrimaryPreviewInsight(
  result: BuilderAnalysisResult | null,
  sectionId: string,
): AiSectionBadge | null {
  if (!result || !PREVIEW_ANNOTATED_SECTIONS.has(sectionId)) return null;
  const section = result.sections.find((s) => s.section_id === sectionId);
  if (!section?.badges?.length) return null;
  return filterMeaningfulBadges(section.badges)[0] ?? null;
}

export function collectStrengthInsights(result: BuilderAnalysisResult | null): string[] {
  if (!result) return [];
  const fromOverview = result.overview.strengths.filter((s) => !isTrivialInsight(s));
  const fromSections = result.sections.flatMap((sec) =>
    filterMeaningfulBadges(sec.badges)
      .filter((b) => b.severity === 'success')
      .map((b) => b.message),
  );
  const seen = new Set<string>();
  return [...fromOverview, ...fromSections].filter((s) => {
    const k = s.slice(0, 48);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 4);
}

export function sanitizeAnalysisResult(result: BuilderAnalysisResult): BuilderAnalysisResult {
  const sections = result.sections
    .filter((s) => s.section_id !== 'contact')
    .map((s) => ({
      ...s,
      badges: filterMeaningfulBadges(s.badges).slice(0, 2),
    }))
    .filter((s) => s.badges.length > 0);

  return {
    ...result,
    overview: {
      ...result.overview,
      strengths: result.overview.strengths.filter((s) => !isTrivialInsight(s)),
      weaknesses: result.overview.weaknesses.filter((s) => !isTrivialInsight(s)),
      recommendations: result.overview.recommendations.filter((s) => !isTrivialInsight(s)),
    },
    sections,
  };
}
