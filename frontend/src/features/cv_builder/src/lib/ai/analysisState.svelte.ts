import i18n from '../../../../../i18n/config';
import type {
  AnalysisLocale,
  BuilderAnalysisResult,
  MultilingualBuilderAnalysis,
  ValidationIssue,
} from '../../../../cv/types/cvAiAnalysis';
import { normalizeAnalysisLocale } from '../../../../cv/utils/resolveActiveAnalysis';
import { sanitizeAnalysisResult } from '../../../../cv/utils/insightQuality';

export type {
  BuilderAnalysisResult,
  MultilingualBuilderAnalysis,
  ValidationIssue,
} from '../../../../cv/types/cvAiAnalysis';

export type AnalysisPhase =
  | 'idle'
  | 'validating'
  | 'analyzing'
  | 'done'
  | 'validation_failed'
  | 'error';

function sanitizeBundle(bundle: MultilingualBuilderAnalysis): MultilingualBuilderAnalysis {
  const localized = {} as MultilingualBuilderAnalysis['localized'];
  for (const code of ['fr', 'en', 'ar'] as const) {
    const slice = bundle.localized[code];
    if (!slice) continue;
    localized[code] = sanitizeAnalysisResult({
      provider: bundle.provider,
      overview: slice.overview,
      sections: slice.sections,
    });
  }
  return { ...bundle, localized };
}

function syncActiveResult() {
  if (!cvAnalysis.localized) {
    cvAnalysis.result = null;
    return;
  }
  const slice =
    cvAnalysis.localized.localized[cvAnalysis.locale] ??
    cvAnalysis.localized.localized.fr;
  if (!slice) {
    cvAnalysis.result = null;
    return;
  }
  cvAnalysis.result = {
    provider: cvAnalysis.localized.provider,
    overview: slice.overview,
    sections: slice.sections,
  };
}

/** Single reactive store — mutate properties only (Svelte 5 export rule). */
export const cvAnalysis = $state({
  phase: 'idle' as AnalysisPhase,
  validationIssues: [] as ValidationIssue[],
  localized: null as MultilingualBuilderAnalysis | null,
  locale: 'fr' as AnalysisLocale,
  /** Active slice for current UI language (preview annotations). */
  result: null as BuilderAnalysisResult | null,
  error: null as string | null,
  configError: null as string | null,
  focusedSection: null as string | null,
});

export function setAnalysisLoading() {
  cvAnalysis.phase = 'analyzing';
  cvAnalysis.error = null;
  cvAnalysis.configError = null;
}

export function setValidationFailed(issues: ValidationIssue[]) {
  cvAnalysis.phase = 'validation_failed';
  cvAnalysis.validationIssues = issues;
  cvAnalysis.localized = null;
  cvAnalysis.result = null;
}

export function applyMultilingualAnalysisResult(bundle: MultilingualBuilderAnalysis) {
  cvAnalysis.localized = sanitizeBundle(bundle);
  cvAnalysis.locale = normalizeAnalysisLocale(i18n.language);
  cvAnalysis.phase = 'done';
  cvAnalysis.validationIssues = [];
  syncActiveResult();
}

/** @deprecated Use applyMultilingualAnalysisResult — kept for single-locale callers. */
export function applyAnalysisResult(result: BuilderAnalysisResult) {
  applyMultilingualAnalysisResult({
    provider: result.provider,
    localized: {
      fr: { overview: result.overview, sections: result.sections },
      en: { overview: result.overview, sections: result.sections },
      ar: { overview: result.overview, sections: result.sections },
    },
  });
}

export function onAnalysisLocaleChanged(lang: string) {
  if (cvAnalysis.phase !== 'done' || !cvAnalysis.localized) return;
  cvAnalysis.locale = normalizeAnalysisLocale(lang);
  syncActiveResult();
}

export function setFocusedSection(section: string | null) {
  cvAnalysis.focusedSection = section;
}

export function setAnalysisError(message: string, isConfig = false) {
  cvAnalysis.phase = 'error';
  if (isConfig) cvAnalysis.configError = message;
  else cvAnalysis.error = message;
}

export function clearAnalysis() {
  cvAnalysis.phase = 'idle';
  cvAnalysis.validationIssues = [];
  cvAnalysis.localized = null;
  cvAnalysis.result = null;
  cvAnalysis.error = null;
  cvAnalysis.configError = null;
  cvAnalysis.focusedSection = null;
}
