import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import AdminsCardContent from '../components/AdminsCardContent';
import { TOTAL_ADMINS_COUNT, adminsMockRows } from '../data/adminsMockData';

const AllAdminsPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    adminsMockRows,
    (r) => [r.name, r.role],
    (r, f) => r.role === f,
  );

  const roleOptions = useMemo(
    () => [...new Set(adminsMockRows.map((r) => r.role))].map((role) => ({ value: role, label: role })),
    [],
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-admins-roles" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.allAdmins.title', { count: TOTAL_ADMINS_COUNT.toLocaleString('en-US') })}
        subtitle={pageTitle('dashboard.allAdmins.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('admins')}
        toolbarAriaLabel="Filter admins"
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [{ value: 'all', label: 'All roles' }, ...roleOptions],
          ariaLabel: 'Filter by role',
        }}
      >
        <AdminsCardContent admins={filtered} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default AllAdminsPage;

