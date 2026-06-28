import { FunctionComponent, useState } from 'react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import StudentFinancialStatusTable from '../components/StudentFinancialStatusTable';
import SrfDashboardKpiStrip from '../components/SrfDashboardKpiStrip';
import { useSrfStudentRows } from '../hooks/useSrfFinancial';
import { useSrfDashboardMetrics } from '../hooks/useSrfDashboardMetrics';
import { SrfErrorState } from '../components/SrfModuleStates';
import '../styles/admin-srf.css';

const StudentFinancialStatusPage: FunctionComponent = () => {
  const [query, setQuery] = useState('');
  const { rows, loading: rowsLoading, error: rowsError, reload: reloadRows } = useSrfStudentRows();
  const {
    metrics,
    loading: metricsLoading,
    reload: reloadMetrics,
  } = useSrfDashboardMetrics(rows);

  const reload = () => {
    void reloadRows();
    reloadMetrics();
  };

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-srf-workspace">
        <SrfDashboardKpiStrip metrics={metrics} loading={metricsLoading || rowsLoading} />
        {rowsError ? (
          <SrfErrorState onRetry={reload} />
        ) : (
          <StudentFinancialStatusTable
            rows={rows}
            loading={rowsLoading}
            query={query}
            onQueryChange={setQuery}
            emptyTitleKey="admin.empty.srfNoAccounts"
            emptyDescriptionKey="admin.empty.srfNoAccountsDesc"
            searchEmptyTitleKey="admin.empty.srfSearchFilters"
          />
        )}
      </div>
    </AdminModulePageShell>
  );
};

export default StudentFinancialStatusPage;
