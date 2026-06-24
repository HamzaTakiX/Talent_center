import { useCallback, useEffect, useState } from 'react';
import { adminHistoryApi, type HistoryListParams } from '../../../admin/api/history';
import type { HistoryActionRow } from '../../../admin/main_history/types';
import { mapEventToRow } from '../../../admin/main_history/utils/historyMappers';

export interface StudentHistoryState {
  rows: HistoryActionRow[];
  summaryLoading: boolean;
  timelineLoading: boolean;
  error: string | null;
  total: number;
  eventsToday: number | null;
}

function createInitialStudentState(): StudentHistoryState {
  return {
    rows: [],
    summaryLoading: true,
    timelineLoading: true,
    error: null,
    total: 0,
    eventsToday: null,
  };
}

export function useStudentHistory(filters: HistoryListParams = {}) {
  const [state, setState] = useState<StudentHistoryState>(createInitialStudentState);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, summaryLoading: true }));

    void (async () => {
      try {
        const data = await adminHistoryApi.dashboard({ lite: true });
        if (cancelled) return;
        const eventsToday =
          data.audit_stats?.find((item) => item.key === 'events_today')?.value ?? 0;
        setState((s) => ({
          ...s,
          eventsToday,
          summaryLoading: false,
        }));
      } catch {
        if (cancelled) return;
        setState((s) => ({ ...s, summaryLoading: false }));
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
          total: data.total,
          timelineLoading: false,
          error: null,
        }));
      } catch {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          rows: [],
          total: 0,
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
    setState((s) => ({ ...s, summaryLoading: true, timelineLoading: true }));
    try {
      const [dashboard, timeline] = await Promise.all([
        adminHistoryApi.dashboard({ lite: true }),
        adminHistoryApi.list(filters),
      ]);
      const eventsToday =
        dashboard.audit_stats?.find((item) => item.key === 'events_today')?.value ?? 0;
      setState({
        rows: timeline.items.map(mapEventToRow),
        total: timeline.total,
        eventsToday,
        summaryLoading: false,
        timelineLoading: false,
        error: null,
      });
    } catch {
      setState((s) => ({
        ...s,
        summaryLoading: false,
        timelineLoading: false,
        error: 'load_error',
      }));
    }
  }, [filters]);

  return { ...state, reload };
}
