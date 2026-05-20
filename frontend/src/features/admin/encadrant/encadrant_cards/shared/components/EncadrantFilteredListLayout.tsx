import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEFAULT_SERVER_PAGE_SIZE,
  useAdminPagination,
} from '../../../../shared/hooks/useAdminPagination';
import {
  AdminKpiStripSkeleton,
  AdminListPageShell,
  AdminStatChartSection,
  type StatPageChartId,
} from '../../../../ui';
import type { AdminEncadrantRow } from '../../../../api/types';
import { encadrantMatchesDepartment } from '../utils/encadrantDisplay';
import { useEncadrantListPageData } from '../hooks/useEncadrantListPageData';
import type { EncadrantListSliceFilter } from '../types/encadrantListSlice';
import EncadrantCardStatGrid from './EncadrantCardStatGrid';
import EncadrantSubpageTableSection from './EncadrantSubpageTableSection';
import EncadrantsSubpageDonutChart from './charts/EncadrantsSubpageDonutChart';

interface EncadrantFilteredListLayoutProps {
  filter: EncadrantListSliceFilter;
  chartId: StatPageChartId;
}

function filterTableRows(
  rows: AdminEncadrantRow[],
  query: string,
  departmentFilter: string,
): AdminEncadrantRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchDept = encadrantMatchesDepartment(row, departmentFilter);
    if (!q) return matchDept;
    const matchQuery =
      (row.full_name || '').toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      String(row.current_students).includes(q) ||
      row.account_status.toLowerCase().includes(q);
    return matchDept && matchQuery;
  });
}

const EncadrantFilteredListLayout: FunctionComponent<EncadrantFilteredListLayoutProps> = ({
  filter,
  chartId,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { loading, allRows, sliceRows, globalStats, kpiStats, departmentOptions } =
    useEncadrantListPageData(filter);

  const tableRows = useMemo(
    () => filterTableRows(sliceRows, query, departmentFilter),
    [sliceRows, query, departmentFilter],
  );

  const {
    page,
    setPage,
    paginatedItems,
    totalItems,
    totalPages,
    pageSize,
    resetPage,
  } = useAdminPagination(tableRows, DEFAULT_SERVER_PAGE_SIZE);

  useEffect(() => {
    resetPage();
  }, [query, departmentFilter, filter, resetPage]);

  return (
    <AdminListPageShell onBack={() => navigate('/admin/encadrants')} backTo="encadrants">
      {loading ? <AdminKpiStripSkeleton count={kpiStats.length || 4} /> : <EncadrantCardStatGrid stats={kpiStats} />}

      <AdminStatChartSection chartId={chartId} loading={loading}>
        <EncadrantsSubpageDonutChart
          filter={filter}
          globalStats={globalStats}
          allRows={allRows}
          loading={loading}
        />
      </AdminStatChartSection>

      <EncadrantSubpageTableSection
        rows={paginatedItems}
        query={query}
        onQueryChange={setQuery}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        departmentOptions={departmentOptions}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        reportsEmpty={filter === 'reports_in_progress'}
      />
    </AdminListPageShell>
  );
};

export default EncadrantFilteredListLayout;
