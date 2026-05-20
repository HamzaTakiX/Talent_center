import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { AdminModulePageSkeleton } from '../../ui';
import { AdminStatChartSection } from '../../ui';
import EncadrantsSummaryGrid from '../components/EncadrantsSummaryGrid';
import EncadrantsTablePanel from '../components/EncadrantsTablePanel';
import EncadrantsSubpageDonutChart from '../encadrant_cards/shared/components/charts/EncadrantsSubpageDonutChart';
import { computeEncadrantStatsFromRows } from '../encadrant_cards/shared/utils/encadrantStats';
import { adminEncadrantsApi } from '../../api/encadrants';
import type { AdminEncadrantRow } from '../../api/types';
import { DEFAULT_SERVER_PAGE_SIZE } from '../../shared/hooks/useAdminPagination';

const KPI_FETCH_PAGE_SIZE = 500;

const AllEncadrantsPage: FunctionComponent = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kpiRows, setKpiRows] = useState<AdminEncadrantRow[]>([]);
  const [tableRows, setTableRows] = useState<AdminEncadrantRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);

  const loadKpi = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await adminEncadrantsApi.list({
        search: query.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: 1,
        page_size: KPI_FETCH_PAGE_SIZE,
      });
      setKpiRows(data.items);
    } catch {
      setKpiRows([]);
    } finally {
      setKpiLoading(false);
    }
  }, [query, statusFilter]);

  const loadTable = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminEncadrantsApi.list({
        search: query.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        page_size: DEFAULT_SERVER_PAGE_SIZE,
      });
      setTableRows(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
    } catch {
      setTableRows([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter, page]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadKpi(), loadTable()]);
  }, [loadKpi, loadTable]);

  useEffect(() => {
    const timer = setTimeout(() => void loadKpi(), 300);
    return () => clearTimeout(timer);
  }, [loadKpi]);

  useEffect(() => {
    const timer = setTimeout(() => void loadTable(), 300);
    return () => clearTimeout(timer);
  }, [loadTable]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const encadrantStats = useMemo(() => computeEncadrantStatsFromRows(kpiRows), [kpiRows]);

  const isInitialLoad =
    loading && kpiLoading && tableRows.length === 0 && kpiRows.length === 0;

  if (isInitialLoad) {
    return (
      <AdminModulePageShell width="wide">
        <AdminModulePageSkeleton />
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
      <div data-admin-search-id="encadrants-stats">
        <EncadrantsSummaryGrid rows={kpiRows} loading={kpiLoading} />
      </div>
      <AdminStatChartSection chartId="encadrants-department-load" loading={kpiLoading}>
        <EncadrantsSubpageDonutChart
          filter="all"
          globalStats={kpiLoading ? null : encadrantStats}
          allRows={kpiRows}
          loading={kpiLoading}
        />
      </AdminStatChartSection>
      <div data-admin-search-id="encadrants-table">
        <EncadrantsTablePanel
          rows={tableRows}
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={DEFAULT_SERVER_PAGE_SIZE}
          onPageChange={setPage}
          onRefresh={refreshAll}
        />
      </div>
    </AdminModulePageShell>
  );
};

export default AllEncadrantsPage;
