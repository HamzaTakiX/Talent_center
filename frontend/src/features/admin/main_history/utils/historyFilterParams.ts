import type { HistoryListParams } from '../../api/history';

/** Stable serialized key so timeline refetch always tracks filter changes. */
export function historyFiltersKey(filters: HistoryListParams): string {
  return JSON.stringify({
    search: filters.search ?? '',
    kpi: filters.kpi ?? '',
    module: filters.module ?? '',
    action: filters.action ?? '',
    criticality: filters.criticality ?? '',
    automated: filters.automated ?? '',
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 25,
  });
}
