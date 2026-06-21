import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminHistoryApi, type HistoryListParams } from '../../api/history';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import type { HistoryActionRow, HistoryStatItem } from '../types';
import type { ModuleAuditKey } from '../constants/moduleAuditDefinitions';
import {
  buildGlobalAuditStats,
  buildModuleAuditStats,
  mapEventToRow,
} from '../utils/historyMappers';
import { historyFiltersKey } from '../utils/historyFilterParams';
import { getCachedHistoryStats, setCachedHistoryStats } from '../utils/historyStatsCache';

const TIMELINE_DEBOUNCE_MS = 350;

export interface HistoryCenterState {
  rows: HistoryActionRow[];
  stats: HistoryStatItem[];
  statsLoading: boolean;
  timelineLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  eventsToday: number | null;
}

export interface UseHistoryCenterOptions {
  moduleKey?: ModuleAuditKey;
  /** Skip KPI card stats; optionally fetch only `eventsToday` for compact summary. */
  auditStatsMode?: 'cards' | 'summary-only' | 'off';
}

function createInitialState(kpi?: string): HistoryCenterState {
  const cached = getCachedHistoryStats(kpi);
  return {
    rows: [],
    stats: cached ?? [],
    statsLoading: !cached?.length,
    timelineLoading: true,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
    eventsToday: null,
  };
}

export function useHistoryCenter(filters: HistoryListParams, options: UseHistoryCenterOptions = {}) {
  const { moduleKey, auditStatsMode = 'cards' } = options;
  const kpi = filters.kpi;
  const fetchAuditStats = auditStatsMode !== 'off';

  const [state, setState] = useState<HistoryCenterState>(() => {
    const initial = createInitialState(auditStatsMode === 'cards' ? kpi : undefined);
    if (auditStatsMode !== 'cards') {
      return { ...initial, stats: [], statsLoading: fetchAuditStats };
    }
    return initial;
  });

  const buildStats = useCallback(
    (auditStats: { key: string; value: number; meta?: Record<string, unknown> }[] | undefined) => {
      if (moduleKey) {
        return buildModuleAuditStats(moduleKey, auditStats);
      }
      return buildGlobalAuditStats(auditStats);
    },
    [moduleKey],
  );

  // Stats: lite dashboard (1-2 SQL queries). Cache + stale-while-revalidate.
  useEffect(() => {
    if (!fetchAuditStats) return;

    let cancelled = false;
    const cached = auditStatsMode === 'cards' ? getCachedHistoryStats(kpi) : null;

    if (!cached?.length) {
      setState((s) => ({ ...s, statsLoading: true }));
    }

    void (async () => {
      try {
        const data = await adminHistoryApi.dashboard({ kpi, lite: true });
        if (cancelled) return;

        if (auditStatsMode === 'summary-only') {
          const eventsToday =
            data.audit_stats?.find((item) => item.key === 'events_today')?.value ?? 0;
          setState((s) => ({
            ...s,
            eventsToday,
            statsLoading: false,
          }));
          return;
        }

        const stats = buildStats(data.audit_stats);
        setCachedHistoryStats(kpi, stats);
        setState((s) => ({
          ...s,
          stats,
          statsLoading: false,
        }));
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          stats: cached ?? [],
          statsLoading: false,
          error: parseAdminApiError(err, 'Unable to load history').message,
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kpi, buildStats, fetchAuditStats, auditStatsMode]);

  const filtersKey = useMemo(
    () => historyFiltersKey(filters),
    [
      filters.search,
      filters.kpi,
      filters.module,
      filters.action,
      filters.criticality,
      filters.automated,
      filters.page,
      filters.page_size,
    ],
  );
  const filtersMounted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const delay = filtersMounted.current ? TIMELINE_DEBOUNCE_MS : 0;
    filtersMounted.current = true;

    setState((s) => ({ ...s, timelineLoading: true, error: null }));

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await adminHistoryApi.list(filters);
          if (cancelled) return;
          setState((s) => ({
            ...s,
            rows: data.items.map(mapEventToRow),
            timelineLoading: false,
            error: null,
            page: data.page,
            totalPages: data.total_pages,
            total: data.total,
          }));
        } catch (err) {
          if (cancelled) return;
          setState((s) => ({
            ...s,
            rows: [],
            timelineLoading: false,
            error: parseAdminApiError(err, 'Unable to load history').message,
            page: 1,
            totalPages: 1,
            total: 0,
          }));
        }
      })();
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filtersKey, filters]);

  const reload = useCallback(async () => {
    setState((s) => ({
      ...s,
      statsLoading: auditStatsMode === 'cards' ? !s.stats.length : fetchAuditStats,
      timelineLoading: true,
      error: null,
    }));
    try {
      const timeline = await adminHistoryApi.list(filters);

      if (auditStatsMode === 'off') {
        setState((s) => ({
          ...s,
          rows: timeline.items.map(mapEventToRow),
          timelineLoading: false,
          error: null,
          page: timeline.page,
          totalPages: timeline.total_pages,
          total: timeline.total,
        }));
        return;
      }

      const dashboard = await adminHistoryApi.dashboard({ kpi, lite: true });

      if (auditStatsMode === 'summary-only') {
        const eventsToday =
          dashboard.audit_stats?.find((item) => item.key === 'events_today')?.value ?? 0;
        setState({
          rows: timeline.items.map(mapEventToRow),
          stats: [],
          statsLoading: false,
          timelineLoading: false,
          error: null,
          page: timeline.page,
          totalPages: timeline.total_pages,
          total: timeline.total,
          eventsToday,
        });
        return;
      }

      const stats = buildStats(dashboard.audit_stats);
      setCachedHistoryStats(kpi, stats);
      setState({
        rows: timeline.items.map(mapEventToRow),
        stats,
        statsLoading: false,
        timelineLoading: false,
        error: null,
        page: timeline.page,
        totalPages: timeline.total_pages,
        total: timeline.total,
        eventsToday: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        statsLoading: false,
        timelineLoading: false,
        error: parseAdminApiError(err, 'Unable to load history').message,
      }));
    }
  }, [filters, kpi, buildStats, auditStatsMode, fetchAuditStats]);

  const loading = useMemo(
    () => state.statsLoading || state.timelineLoading,
    [state.statsLoading, state.timelineLoading],
  );

  return {
    ...state,
    loading,
    reload,
  };
}
