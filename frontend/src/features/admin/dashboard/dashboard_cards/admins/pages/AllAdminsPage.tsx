import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import { adminAdministratorsApi } from '../../../../api/administrators';
import type { AdminAdministratorRow, AdminRoleSlug } from '../../../../api/types';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import { useDashboardCardEntities } from '../../shared/hooks/useDashboardCardEntities';
import { administratorRolesKey } from '../../shared/utils/dashboardCardFilters';
import { useAdminTableValues } from '../../../../i18n/useAdminTableValues';
import AdminsCardContent from '../components/AdminsCardContent';

const AllAdminsPage: FunctionComponent = () => {
  const { pageTitle, searchPlaceholder } = useAdminCopy();
  const { adminRole } = useAdminTableValues();
  const { items, total, loading } = useDashboardCardEntities<AdminAdministratorRow>(
    adminAdministratorsApi.list,
  );

  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    items,
    (r) => [r.full_name, r.email, ...r.role_slugs.map((slug) => adminRole(slug))],
    (r, f) => administratorRolesKey(r) === f,
  );

  const roleOptions = useMemo(() => {
    const keys = [...new Set(items.map((r) => administratorRolesKey(r)))].filter((k) => k !== 'none');
    return keys
      .sort()
      .map((key) => ({
        value: key,
        label: key
          .split(',')
          .map((slug) => adminRole(slug.trim() as AdminRoleSlug))
          .join(', '),
      }));
  }, [items, adminRole]);

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-admins-roles" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.allAdmins.title', {
          count: total.toLocaleString('en-US'),
        })}
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
        <AdminsCardContent admins={filtered} loading={loading} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default AllAdminsPage;
