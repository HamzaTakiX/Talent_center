import type { CvAnalysisDashboardData, CvAnalysisStatus } from '../types/cvAnalysisDashboard';

const CACHE_KEY = 'tc-cv-dashboard-last';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface CachedCvDashboard {
  dashboard: CvAnalysisDashboardData;
  status: CvAnalysisStatus;
  analyzedCvHash: string | null;
  savedAt: number;
}

export function readCachedCvDashboard(): CachedCvDashboard | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCvDashboard;
    if (!parsed?.dashboard || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedCvDashboard(
  dashboard: CvAnalysisDashboardData,
  status: CvAnalysisStatus,
  analyzedCvHash: string | null,
): void {
  try {
    const entry: CachedCvDashboard = {
      dashboard,
      status,
      analyzedCvHash,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable
  }
}

export function clearCachedCvDashboard(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
