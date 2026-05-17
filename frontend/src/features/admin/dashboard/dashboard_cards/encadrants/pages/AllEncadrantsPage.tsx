import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import EncadrantsCardContent from '../components/EncadrantsCardContent';
import { TOTAL_ENCADRANTS_COUNT, encadrantsMockRows } from '../data/encadrantsMockData';

const AllEncadrantsPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    encadrantsMockRows,
    (r) => [r.name, r.department, String(r.studentsAssigned)],
    (r, f) => r.department === f,
  );

  const departmentOptions = useMemo(
    () => [...new Set(encadrantsMockRows.map((r) => r.department))].map((d) => ({ value: d, label: d })),
    [],
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-encadrants-dept" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.allEncadrants.title', { count: TOTAL_ENCADRANTS_COUNT.toLocaleString('en-US') })}
        subtitle={pageTitle('dashboard.allEncadrants.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('encadrants')}
        toolbarAriaLabel="Filter encadrants"
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [{ value: 'all', label: 'All departments' }, ...departmentOptions],
          ariaLabel: 'Filter by department',
        }}
      >
        <EncadrantsCardContent encadrants={filtered} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default AllEncadrantsPage;

