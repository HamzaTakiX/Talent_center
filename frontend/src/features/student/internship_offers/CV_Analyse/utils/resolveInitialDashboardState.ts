import type {
  CvAnalysisDashboardData,
  CvAnalysisStatus,
  DashboardViewState,
} from '../types/cvAnalysisDashboard';
import { resolveStudentCvSnapshot } from './cvDraftReader';
import { buildEmptyDashboard } from './mapBuilderAnalysisToDashboard';
import { clearCachedCvDashboard, readCachedCvDashboard } from './cvAnalysisDashboardCache';

export function resolveInitialDashboardState(initialState: DashboardViewState = 'success'): {
  viewState: DashboardViewState;
  data: CvAnalysisDashboardData | null;
  analysisStatus: CvAnalysisStatus;
} {
  if (initialState !== 'success') {
    return { viewState: initialState, data: null, analysisStatus: 'none' };
  }

  const resolved = resolveStudentCvSnapshot(null);
  const cache = readCachedCvDashboard();
  if (cache?.dashboard) {
    if (cache.dashboard.cvSource === 'imported') {
      clearCachedCvDashboard();
    } else {
      const cachedHash = cache.analyzedCvHash ?? cache.dashboard.meta?.cvHash ?? null;
      const snapshotStale =
        resolved &&
        cache.dashboard.cvSnapshot &&
        JSON.stringify(cache.dashboard.cvSnapshot) !== JSON.stringify(resolved.cv);
      if (snapshotStale || (cache.status === 'up_to_date' && !cachedHash)) {
        clearCachedCvDashboard();
      } else {
        return {
          viewState: 'success',
          data: cache.dashboard,
          analysisStatus: cache.status,
        };
      }
    }
  }

  if (resolved) {
    const cvSource = resolved.source === 'profile_file' ? 'imported' : 'builder';
    const empty = buildEmptyDashboard(resolved.cv, {
      cvFileName: resolved.fileName,
      cvSource,
    });
    return {
      viewState: 'success',
      data: {
        ...empty,
        cvSnapshot: resolved.cv,
        meta: { ...empty.meta, analysisStatus: 'none' },
      },
      analysisStatus: 'none',
    };
  }

  return { viewState: 'loading', data: null, analysisStatus: 'none' };
}
