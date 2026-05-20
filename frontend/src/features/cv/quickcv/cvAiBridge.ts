import type {
  BuilderAnalysisResult,
  MultilingualBuilderAnalysis,
} from '../types/cvAiAnalysis';
import type { CvValidationIssue } from '../validation/cvBuilderValidation';
import { normalizeAnalysisLocale, pickLocalizedAnalysis } from '../utils/resolveActiveAnalysis';

export type CvAiBridgePhase =
  | 'idle'
  | 'analyzing'
  | 'validation_failed'
  | 'done'
  | 'error'
  | 'config_error';

type Listener = () => void;

let phase: CvAiBridgePhase = 'idle';
let validationIssues: CvValidationIssue[] = [];
let localized: MultilingualBuilderAnalysis | null = null;
let locale = normalizeAnalysisLocale(
  typeof document !== 'undefined' ? document.documentElement.lang : 'fr',
);
let errorMessage: string | null = null;
let configMessage: string | null = null;
let focusedSection: string | null = null;

const listeners = new Set<Listener>();

function activeResult(): BuilderAnalysisResult | null {
  return pickLocalizedAnalysis(localized, locale);
}

export const cvAiBridge = {
  get phase() {
    return phase;
  },
  get validationIssues() {
    return validationIssues;
  },
  get localized() {
    return localized;
  },
  get result() {
    return activeResult();
  },
  get errorMessage() {
    return errorMessage;
  },
  get configMessage() {
    return configMessage;
  },
  get focusedSection() {
    return focusedSection;
  },
  setLocale(lang: string) {
    const next = normalizeAnalysisLocale(lang);
    if (next === locale) return;
    locale = next;
    listeners.forEach((fn) => fn());
    window.dispatchEvent(new CustomEvent('quickcv:ai-state'));
  },
  setFocusedSection(section: string | null) {
    if (focusedSection === section) return;
    focusedSection = section;
    listeners.forEach((fn) => fn());
    window.dispatchEvent(
      new CustomEvent('quickcv:ai-focus-section', { detail: section }),
    );
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  _emit(updates: Partial<{
    phase: CvAiBridgePhase;
    validationIssues: CvValidationIssue[];
    localized: MultilingualBuilderAnalysis | null;
    result: BuilderAnalysisResult | null;
    errorMessage: string | null;
    configMessage: string | null;
    focusedSection: string | null;
  }>) {
    if (updates.phase !== undefined) phase = updates.phase;
    if (updates.validationIssues !== undefined) validationIssues = updates.validationIssues;
    if (updates.localized !== undefined) localized = updates.localized;
    if (updates.result !== undefined && updates.localized === undefined) {
      /* legacy single-locale emit */
      if (updates.result) {
        localized = {
          provider: updates.result.provider,
          localized: {
            fr: { overview: updates.result.overview, sections: updates.result.sections },
            en: { overview: updates.result.overview, sections: updates.result.sections },
            ar: { overview: updates.result.overview, sections: updates.result.sections },
          },
        };
      } else {
        localized = null;
      }
    }
    if (updates.errorMessage !== undefined) errorMessage = updates.errorMessage;
    if (updates.configMessage !== undefined) configMessage = updates.configMessage;
    if ('focusedSection' in updates) focusedSection = updates.focusedSection ?? null;
    listeners.forEach((fn) => fn());
    window.dispatchEvent(new CustomEvent('quickcv:ai-state'));
  },
  reset() {
    this._emit({
      phase: 'idle',
      validationIssues: [],
      localized: null,
      errorMessage: null,
      configMessage: null,
      focusedSection: null,
    });
  },
};

export const requestCvAiAnalysis = () => {
  window.dispatchEvent(new Event('quickcv:analyze'));
};

export const requestCvSave = () => {
  window.dispatchEvent(new Event('quickcv:save'));
};
