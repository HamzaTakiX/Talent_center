import { useEffect, useMemo, useState } from 'react';
import { adminEncadrantsApi } from '../../../../api/encadrants';
import type { AdminEncadrantRow } from '../../../../api/types';
import { filterEncadrantsBySlice } from '../utils/encadrantListFilters';
import { buildEncadrantSubpageKpiStats } from '../utils/encadrantSubpageKpiStats';
import { computeEncadrantStatsFromRows } from '../utils/encadrantStats';
import { encadrantDepartmentOptions } from '../utils/encadrantDisplay';
import type { EncadrantListSliceFilter } from '../types/encadrantListSlice';

export function useEncadrantListPageData(filter: EncadrantListSliceFilter) {
  const [allRows, setAllRows] = useState<AdminEncadrantRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminEncadrantsApi
      .list({ page: 1, page_size: 500 })
      .then((data) => {
        if (!cancelled) setAllRows(data.items);
      })
      .catch(() => {
        if (!cancelled) setAllRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const globalStats = useMemo(() => computeEncadrantStatsFromRows(allRows), [allRows]);

  const sliceRows = useMemo(
    () => filterEncadrantsBySlice(allRows, filter),
    [allRows, filter],
  );

  const kpiStats = useMemo(
    () => buildEncadrantSubpageKpiStats(filter, sliceRows, globalStats),
    [filter, sliceRows, globalStats],
  );

  const departmentOptions = useMemo(
    () => encadrantDepartmentOptions(sliceRows),
    [sliceRows],
  );

  return {
    loading,
    allRows,
    sliceRows,
    globalStats,
    kpiStats,
    departmentOptions,
  };
}
