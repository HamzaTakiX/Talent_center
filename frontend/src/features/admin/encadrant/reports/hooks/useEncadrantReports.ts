import { useCallback, useEffect, useState } from 'react';
import type { EncadrantReportRow } from '../data/encadrantReportsMock';
import { useSupervisionReports } from './useSupervisionReports';

/** @deprecated Prefer useSupervisionReports — kept for encadrants summary grid compat. */
export function useEncadrantReports() {
  const { rows, loading, error, reload } = useSupervisionReports({ page_size: 500 });
  const [legacyRows, setLegacyRows] = useState<EncadrantReportRow[]>([]);

  useEffect(() => {
    setLegacyRows(rows);
  }, [rows]);

  const load = useCallback(() => reload(), [reload]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows: legacyRows, loading, error, reload: load };
}
