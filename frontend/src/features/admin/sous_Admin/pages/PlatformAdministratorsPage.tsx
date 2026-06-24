import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAdministratorsApi } from '../../api/administrators';
import type { AdminAdministratorRow } from '../../api/types';
import { useAdminTableDeleteFlow } from '../../shared/hooks/useAdminTableDeleteFlow';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { AdminModulePageSkeleton } from '../../ui';
import AdminModulePanel from '../../ui/AdminModulePanel';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminToolbarDeleteControl from '../../ui/AdminToolbarDeleteControl';
import PlatformAdministratorsKpiSection from '../components/PlatformAdministratorsKpiSection';
import PlatformAdministratorsToolbar from '../components/PlatformAdministratorsToolbar';
import PlatformAdministratorsMainTable from '../components/PlatformAdministratorsMainTable';
import { DEFAULT_SERVER_PAGE_SIZE } from '../../shared/hooks/useAdminPagination';
const KPI_FETCH_PAGE_SIZE = 500;

const PlatformAdministratorsPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [kpiRows, setKpiRows] = useState<AdminAdministratorRow[]>([]);
  const [tableRows, setTableRows] = useState<AdminAdministratorRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [error, setError] = useState('');

  const loadKpi = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await adminAdministratorsApi.list({
        search: query.trim() || undefined,
        page: 1,
        page_size: KPI_FETCH_PAGE_SIZE,
      });
      setKpiRows(data.items);
    } catch {
      setKpiRows([]);
    } finally {
      setKpiLoading(false);
    }
  }, [query]);

  const loadTable = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAdministratorsApi.list({
        search: query.trim() || undefined,
        page,
        page_size: DEFAULT_SERVER_PAGE_SIZE,
      });
      setTableRows(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
    } catch {
      setError(t('admin.forms.createAdministrator.messages.loadError'));
      setTableRows([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [query, page, t]);

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
  }, [query]);

  const {
    selectionMode,
    selection,
    deleteDialog,
    deleteTitle,
    deleteDescription,
    runDelete,
    closeDeleteDialog,
    enterSelectionMode,
    exitSelectionMode,
    confirmDelete,
  } = useAdminTableDeleteFlow({
    rows: tableRows,
    kind: 'admin',
    deleteOne: adminAdministratorsApi.delete,
    deleteBulk: adminAdministratorsApi.bulkDelete,
    onRefresh: refreshAll,
  });

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
      <AdminDeleteConfirmModal
        open={deleteDialog != null}
        onClose={closeDeleteDialog}
        onConfirm={runDelete}
        title={deleteTitle}
        description={deleteDescription}
      />
      <div data-admin-search-id="admins-stats">
        <PlatformAdministratorsKpiSection rows={kpiRows} loading={kpiLoading} />
      </div>
      <div data-admin-search-id="admins-table">
        <AdminModulePanel>
          <PlatformAdministratorsToolbar
            query={query}
            onQueryChange={setQuery}
            onCreateAdmin={() => navigate('/admin/admins/create-administrator')}
            onRefresh={refreshAll}
            deleteControl={
              <AdminToolbarDeleteControl
                selectionMode={selectionMode}
                selectedCount={selection.selectedCount}
                onEnterSelectionMode={enterSelectionMode}
                onExitSelectionMode={exitSelectionMode}
                onConfirmDelete={confirmDelete}
              />
            }
          />
          {error && !loading ? (
            <p className="px-6 py-2 text-sm text-red-400">{error}</p>
          ) : null}
          <PlatformAdministratorsMainTable
            rows={tableRows}
            loading={loading}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={DEFAULT_SERVER_PAGE_SIZE}
            onPageChange={setPage}
            selectionMode={selectionMode}
            selection={selection}
          />
        </AdminModulePanel>
      </div>
    </AdminModulePageShell>
  );
};

export default PlatformAdministratorsPage;
