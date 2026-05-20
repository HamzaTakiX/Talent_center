import { useCallback, useEffect, useState } from 'react';
import { adminSupervisionReportsApi } from '../../../api/supervisionReports';
import type { SupervisionReportDetail } from '../types/supervisionReport';

export function useSupervisionReportDetail(reportId: string | undefined) {
  const [report, setReport] = useState<SupervisionReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!reportId) return Promise.resolve();
    setLoading(true);
    setError(null);
    return adminSupervisionReportsApi
      .detail(reportId)
      .then(setReport)
      .catch((err: unknown) => {
        setReport(null);
        setError(err instanceof Error ? err.message : 'Rapport introuvable.');
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { report, loading, error, reload: load, setReport };
}
