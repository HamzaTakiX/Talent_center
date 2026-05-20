import i18n from '../../../../../i18n/config';
import { analyzeCvBuilderSafe } from '../../../../cv/api/cvBuilderAnalysisApi';
import { validateCvPayload } from '../../../../cv/validation/cvBuilderValidation';
import { cvAiBridge } from '../../../../cv/quickcv/cvAiBridge';
import { getCvSnapshot } from '$lib/state/index.svelte';
import {
  applyMultilingualAnalysisResult,
  cvAnalysis,
  setAnalysisError,
  setAnalysisLoading,
  setValidationFailed,
  clearAnalysis,
  setFocusedSection,
  onAnalysisLocaleChanged,
} from './analysisState.svelte';

export async function runPremiumCvAnalysis() {
  const payload = getCvSnapshot() as Record<string, unknown>;

  const { valid, issues } = validateCvPayload(payload);
  if (!valid) {
    setValidationFailed(issues);
    cvAiBridge._emit({ phase: 'validation_failed', validationIssues: issues });
    highlightSections(issues.map((i) => i.section));
    return;
  }

  setAnalysisLoading();
  cvAiBridge._emit({ phase: 'analyzing', validationIssues: [], errorMessage: null, configMessage: null });

  const outcome = await analyzeCvBuilderSafe(payload);

  if (!outcome.ok) {
    if ('validationIssues' in outcome) {
      setValidationFailed(outcome.validationIssues);
      cvAiBridge._emit({ phase: 'validation_failed', validationIssues: outcome.validationIssues });
      highlightSections(outcome.validationIssues.map((i) => i.section));
      return;
    }
    if ('configError' in outcome) {
      setAnalysisError(outcome.configError, true);
      cvAiBridge._emit({ phase: 'config_error', configMessage: outcome.configError });
      return;
    }
    setAnalysisError(outcome.error);
    cvAiBridge._emit({ phase: 'error', errorMessage: outcome.error });
    return;
  }

  applyMultilingualAnalysisResult(outcome.result);
  cvAiBridge.setLocale(i18n.language);
  const active = cvAnalysis.result;
  cvAiBridge._emit({ phase: 'done', localized: outcome.result, result: active });
  clearValidationHighlights();
  const weakest = active?.overview?.weakest_section;
  if (weakest) {
    applySectionFocus(weakest);
    cvAiBridge.setFocusedSection(weakest);
  }
}

export function applySectionFocus(section: string | null) {
  setFocusedSection(section);
  document.querySelectorAll('[data-cv-preview-section]').forEach((el) => {
    const id = el.getAttribute('data-cv-preview-section');
    const on = !!section && id === section;
    el.classList.toggle('cv-preview-section--focus', on);
    if (on) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

export function resetCvAnalysis() {
  clearAnalysis();
  cvAiBridge.reset();
  clearSectionHighlights();
  applySectionFocus(null);
}

export function initCvAiSectionFocusListener() {
  const focusHandler = (e: Event) => {
    const section = (e as CustomEvent<string | null>).detail ?? null;
    applySectionFocus(section);
  };
  window.addEventListener('quickcv:ai-focus-section', focusHandler);

  const onLang = (lng: string) => {
    onAnalysisLocaleChanged(lng);
    cvAiBridge.setLocale(lng);
  };
  i18n.on('languageChanged', onLang);

  return () => {
    window.removeEventListener('quickcv:ai-focus-section', focusHandler);
    i18n.off('languageChanged', onLang);
  };
}

function highlightSections(sections: string[]) {
  document.querySelectorAll('[data-cv-section]').forEach((el) => {
    const id = el.getAttribute('data-cv-section');
    el.classList.toggle('cv-section--highlight-warn', !!id && sections.includes(id));
  });
}

function clearValidationHighlights() {
  document.querySelectorAll('.cv-section--highlight-warn').forEach((el) => {
    el.classList.remove('cv-section--highlight-warn');
  });
}

function clearSectionHighlights() {
  clearValidationHighlights();
  applySectionFocus(null);
}
