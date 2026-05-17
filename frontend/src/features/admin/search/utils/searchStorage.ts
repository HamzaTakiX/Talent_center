import { MAX_RECENT_SEARCHES, MAX_VISITED, RECENT_SEARCHES_KEY, VISITED_SECTIONS_KEY } from '../types';

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode */
  }
};

export const getRecentSearches = (): string[] =>
  readJson<string[]>(RECENT_SEARCHES_KEY, []).slice(0, MAX_RECENT_SEARCHES);

export const addRecentSearch = (query: string): void => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;
  const prev = getRecentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  writeJson(RECENT_SEARCHES_KEY, [trimmed, ...prev].slice(0, MAX_RECENT_SEARCHES));
};

export const clearRecentSearches = (): void => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

export interface VisitedSection {
  id: string;
  visitedAt: number;
}

export const getVisitedSections = (): VisitedSection[] =>
  readJson<VisitedSection[]>(VISITED_SECTIONS_KEY, []).slice(0, MAX_VISITED);

export const recordVisitedSection = (id: string): void => {
  const now = Date.now();
  const prev = getVisitedSections().filter((v) => v.id !== id);
  writeJson(VISITED_SECTIONS_KEY, [{ id, visitedAt: now }, ...prev].slice(0, MAX_VISITED));
};
