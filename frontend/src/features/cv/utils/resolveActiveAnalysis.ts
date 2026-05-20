import type {
  AnalysisLocale,
  BuilderAnalysisResult,
  MultilingualBuilderAnalysis,
} from '../types/cvAiAnalysis';

export function normalizeAnalysisLocale(lang: string | undefined): AnalysisLocale {
  const code = (lang || 'fr').slice(0, 2).toLowerCase();
  if (code === 'en' || code === 'ar') return code;
  return 'fr';
}

export function pickLocalizedAnalysis(
  bundle: MultilingualBuilderAnalysis | null,
  lang: string | undefined,
): BuilderAnalysisResult | null {
  if (!bundle?.localized) return null;
  const locale = normalizeAnalysisLocale(lang);
  const slice = bundle.localized[locale] ?? bundle.localized.fr;
  if (!slice) return null;
  return {
    provider: bundle.provider,
    overview: slice.overview,
    sections: slice.sections,
  };
}
