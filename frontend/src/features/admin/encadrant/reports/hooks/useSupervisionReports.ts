import { useCallback, useEffect, useState } from 'react';
import { adminSupervisionReportsApi } from '../../../api/supervisionReports';
import type {
  SupervisionReportDashboardSummary,
  SupervisionReportListItem,
  SupervisionReportListParams,
} from '../types/supervisionReport';
import { toTableRow } from '../types/supervisionReport';
import type { EncadrantReportRow } from '../data/encadrantReportsMock';

export function useSupervisionReports(params?: SupervisionReportListParams) {
  const [items, setItems] = useState<SupervisionReportListItem[]>([]);
  const [rows, setRows] = useState<EncadrantReportRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return adminSupervisionReportsApi
      .list(params)
      .then((data) => {
        setItems(data.items);
        setRows(data.items.map(toTableRow));
        setPagination({
          page: data.pagination.page,
          total: data.pagination.total,
          totalPages: data.pagination.total_pages,
        });
      })
      .catch((err: unknown) => {
        setItems([]);
        setRows([]);
        setError(err instanceof Error ? err.message : 'Impossible de charger les rapports.');
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, rows, pagination, loading, error, reload: load };
}

export function useSupervisionReportsDashboard() {
  const [summary, setSummary] = useState<SupervisionReportDashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    return adminSupervisionReportsApi
      .dashboard()
      .then((data) => {
        setSummary(data.summary);
        setAnalytics(data.analytics);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erreur dashboard rapports.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { summary, analytics, loading, error, reload: load };
}
