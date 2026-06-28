import type { State } from './types';
import { data, getCvSnapshot } from './index.svelte';

export const CV_DRAFT_STORAGE_KEY = 'talent-center-quickcv-draft';

const DRAFT_KEY = CV_DRAFT_STORAGE_KEY;
const AUTOSAVE_DELAY_MS = 800;

let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
let autosaveReady = false;

function isNonEmpty(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasMeaningfulRecord(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(isNonEmpty);
}

/** True when the in-memory CV has user-entered content (survives Svelte remounts). */
export function hasUserCvContent(): boolean {
  if (Object.values(data.details).some(isNonEmpty)) return true;

  return [data.workExp, data.education, data.projects, data.skills, data.languages].some(
    (list) => list.some((item) => hasMeaningfulRecord(item as Record<string, unknown>)),
  );
}

export function markCvDraftAutosaveReady(): void {
  autosaveReady = true;
}

export function scheduleCvDraftAutosave(): void {
  if (!autosaveReady) return;

  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    const ok = saveCvDraft();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('quickcv:save-done', { detail: { ok, autosave: true } }),
      );
    }
  }, AUTOSAVE_DELAY_MS);
}

export function saveCvDraft(): boolean {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(getCvSnapshot()));
    return true;
  } catch {
    return false;
  }
}

export function loadCvDraft(): boolean {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return false;
    const snap = JSON.parse(raw) as Partial<State>;
    applyCvSnapshot(snap);
    return true;
  } catch {
    return false;
  }
}

function applyCvSnapshot(snap: Partial<State>) {
  if (snap.details && typeof snap.details === 'object') {
    Object.assign(data.details, snap.details);
  }
  if (Array.isArray(snap.workExp)) {
    data.workExp.length = 0;
    data.workExp.push(...snap.workExp);
  }
  if (Array.isArray(snap.education)) {
    data.education.length = 0;
    data.education.push(...snap.education);
  }
  if (Array.isArray(snap.projects)) {
    data.projects.length = 0;
    data.projects.push(...snap.projects);
  }
  if (Array.isArray(snap.skills)) {
    data.skills.length = 0;
    data.skills.push(...snap.skills);
  }
  if (Array.isArray(snap.languages)) {
    data.languages.length = 0;
    data.languages.push(...snap.languages);
  }
}
