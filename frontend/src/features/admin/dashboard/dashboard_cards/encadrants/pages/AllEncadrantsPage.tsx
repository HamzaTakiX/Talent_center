import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { adminEncadrantsApi } from '../../../../api/encadrants';
import type { AdminEncadrantRow } from '../../../../api/types';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import { useDashboardCardEntities } from '../../shared/hooks/useDashboardCardEntities';
import { encadrantProgramsLabel } from '../../shared/utils/dashboardCardFilters';
import EncadrantsCardContent from '../components/EncadrantsCardContent';

const AllEncadrantsPage: FunctionComponent = () => {
  const { pageTitle, searchPlaceholder } = useAdminCopy();
  const { t } = useTranslation();
  const globalScopeLabel = t('admin.tables.administrators.scopeGlobal');
  const { items, total, loading } = useDashboardCardEntities<AdminEncadrantRow>(adminEncadrantsApi.list);

  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    items,
    (r) => [r.full_name, r.email, encadrantProgramsLabel(r, globalScopeLabel), String(r.current_students)],
    (r, f) => encadrantProgramsLabel(r, globalScopeLabel) === f,
  );

  const programOptions = useMemo(() => {
    const programs = [
      ...new Set(items.map((r) => encadrantProgramsLabel(r, globalScopeLabel)).filter((p) => p !== '—')),
    ];
    return programs.sort().map((p) => ({ value: p, label: p }));
  }, [items, globalScopeLabel]);

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-encadrants-dept" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.allEncadrants.title', {
          count: total.toLocaleString('en-US'),
        })}
        subtitle={pageTitle('dashboard.allEncadrants.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('encadrants')}
        toolbarAriaLabel="Filter encadrants"
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [{ value: 'all', label: 'All programs' }, ...programOptions],
          ariaLabel: 'Filter by program',
        }}
      >
        <EncadrantsCardContent encadrants={filtered} loading={loading} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default AllEncadrantsPage;
