import { useEffect, useMemo, useState } from 'react';
import { adminStudentsApi } from '../../../../api/students';
import type { AdminStudentRow, StudentDashboardStats } from '../../../../api/types';
import type { StudentListSliceFilter } from '../types/studentListSlice';
import { filterStudentsBySlice } from '../utils/studentListFilters';
import { buildStudentSubpageKpiStats } from '../utils/studentSubpageKpiStats';
import type { StudentCardStatItem } from '../../../components/StudentCardStatGrid';
import { studentFieldLabel } from '../../../../dashboard/dashboard_cards/shared/utils/dashboardCardFilters';

export function useStudentListPageData(filter: StudentListSliceFilter) {
  const [allRows, setAllRows] = useState<AdminStudentRow[]>([]);
  const [globalStats, setGlobalStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      adminStudentsApi.list({ page: 1, page_size: 500 }),
      adminStudentsApi.stats(),
    ])
      .then(([list, stats]) => {
        if (cancelled) return;
        setAllRows(list.items);
        setGlobalStats(stats);
      })
      .catch(() => {
        if (cancelled) return;
        setAllRows([]);
        setGlobalStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sliceRows = useMemo(
    () => filterStudentsBySlice(allRows, filter),
    [allRows, filter],
  );

  const kpiStats: StudentCardStatItem[] = useMemo(
    () => buildStudentSubpageKpiStats(filter, sliceRows, globalStats),
    [filter, sliceRows, globalStats],
  );

  const fieldOptions = useMemo(
    () => [...new Set(sliceRows.map((row) => studentFieldLabel(row)))].filter(Boolean).sort(),
    [sliceRows],
  );

  return {
    loading,
    allRows,
    sliceRows,
    globalStats,
    kpiStats,
    fieldOptions,
  };
}
