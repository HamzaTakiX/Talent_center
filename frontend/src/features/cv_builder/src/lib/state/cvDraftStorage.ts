import type { State } from './types';
import { data, getCvSnapshot } from './index.svelte';

const DRAFT_KEY = 'talent-center-quickcv-draft';

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
