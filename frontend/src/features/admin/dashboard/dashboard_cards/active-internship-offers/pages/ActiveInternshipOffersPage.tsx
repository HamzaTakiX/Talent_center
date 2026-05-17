import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import ActiveOffersCardContent from '../components/ActiveOffersCardContent';
import { ACTIVE_OFFERS_COUNT, activeOffersMockRows } from '../data/activeOffersMockData';

const ActiveInternshipOffersPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    activeOffersMockRows,
    (r) => [r.title, r.company, r.status, String(r.applicants)],
    (r, f) => r.company === f,
  );

  const companyOptions = useMemo(
    () => [...new Set(activeOffersMockRows.map((r) => r.company))].map((c) => ({ value: c, label: c })),
    [],
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-active-offers-apps" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.activeOffers.title', { count: ACTIVE_OFFERS_COUNT.toLocaleString('en-US') })}
        subtitle={pageTitle('dashboard.activeOffers.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('offers')}
        toolbarAriaLabel="Filter offers"
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [{ value: 'all', label: 'All companies' }, ...companyOptions],
          ariaLabel: 'Filter by company',
        }}
      >
        <ActiveOffersCardContent offers={filtered} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default ActiveInternshipOffersPage;

