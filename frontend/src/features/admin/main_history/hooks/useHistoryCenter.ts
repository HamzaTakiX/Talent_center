import { useCallback, useEffect, useState } from 'react';
import { adminHistoryApi, type HistoryListParams } from '../../api/history';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import type { HistoryActionRow, HistoryStatItem } from '../types';
import { buildStatsFromDashboard, mapEventToRow } from '../utils/historyMappers';

export interface HistoryCenterState {
  rows: HistoryActionRow[];
  stats: HistoryStatItem[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
}

const emptyState: HistoryCenterState = {
  rows: [],
  stats: [],
  loading: true,
  error: null,
  page: 1,
  totalPages: 1,
};

export function useHistoryCenter(filters: HistoryListParams) {
  const [state, setState] = useState<HistoryCenterState>(emptyState);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await adminHistoryApi.center(filters);
      setState({
        rows: data.timeline.items.map(mapEventToRow),
        stats: buildStatsFromDashboard(data.dashboard.module_stats),
        loading: false,
        error: null,
        page: data.timeline.page,
        totalPages: data.timeline.total_pages,
      });
    } catch (err) {
      setState({
        rows: [],
        stats: [],
        loading: false,
        error: parseAdminApiError(err, 'Unable to load history').message,
        page: 1,
        totalPages: 1,
      });
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}
