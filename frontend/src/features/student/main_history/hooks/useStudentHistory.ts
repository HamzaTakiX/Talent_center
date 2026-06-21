import { useCallback, useEffect, useState } from 'react';
import { adminHistoryApi, type HistoryListParams } from '../../../admin/api/history';
import type { HistoryActionRow, HistoryStatItem } from '../../../admin/main_history/types';
import { buildStudentAuditStats, mapEventToRow } from '../../../admin/main_history/utils/historyMappers';
import {
  getCachedHistoryStats,
  setCachedHistoryStats,
} from '../../../admin/main_history/utils/historyStatsCache';

const STUDENT_CACHE_KEY = '__student__';

export interface StudentHistoryState {
  rows: HistoryActionRow[];
  stats: HistoryStatItem[];
  statsLoading: boolean;
  timelineLoading: boolean;
  error: string | null;
}

function createInitialStudentState(): StudentHistoryState {
  const cached = getCachedHistoryStats(STUDENT_CACHE_KEY);
  return {
    rows: [],
    stats: cached ?? [],
    statsLoading: !cached?.length,
    timelineLoading: true,
    error: null,
  };
}

export function useStudentHistory(filters: HistoryListParams = {}) {
  const [state, setState] = useState<StudentHistoryState>(createInitialStudentState);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedHistoryStats(STUDENT_CACHE_KEY);
    if (!cached?.length) {
      setState((s) => ({ ...s, statsLoading: true }));
    }

    void (async () => {
      try {
        const data = await adminHistoryApi.dashboard({ lite: true });
        if (cancelled) return;
        const stats = buildStudentAuditStats(data.audit_stats);
        setCachedHistoryStats(STUDENT_CACHE_KEY, stats);
        setState((s) => ({ ...s, stats, statsLoading: false }));
      } catch {
        if (cancelled) return;
        setState((s) => ({ ...s, stats: cached ?? [], statsLoading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, timelineLoading: true, error: null }));

    void (async () => {
      try {
        const data = await adminHistoryApi.list(filters);
        if (cancelled) return;
        setState((s) => ({
          ...s,
          rows: data.items.map(mapEventToRow),
          timelineLoading: false,
          error: null,
        }));
      } catch {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          rows: [],
          timelineLoading: false,
          error: 'load_error',
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, statsLoading: !s.stats.length, timelineLoading: true }));
    try {
      const [dashboard, timeline] = await Promise.all([
        adminHistoryApi.dashboard({ lite: true }),
        adminHistoryApi.list(filters),
      ]);
      const stats = buildStudentAuditStats(dashboard.audit_stats);
      setCachedHistoryStats(STUDENT_CACHE_KEY, stats);
      setState({
        rows: timeline.items.map(mapEventToRow),
        stats,
        statsLoading: false,
        timelineLoading: false,
        error: null,
      });
    } catch {
      setState((s) => ({ ...s, statsLoading: false, timelineLoading: false, error: 'load_error' }));
    }
  }, [filters]);

  return { ...state, reload };
}
