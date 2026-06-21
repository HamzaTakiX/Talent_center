import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import ActiveOffersCardContent from '../components/ActiveOffersCardContent';
import { useStageOffersByStatus } from '../../../../offres-stage/hooks/useStageOffers';
import OffersListLoading from '../../../../offres-stage/components/OffersListLoading';
import { useOffersListLabels } from '../../../../offres-stage/hooks/useOffersListLabels';

const ActiveInternshipOffersPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle } = useAdminCopy();
  const { searchPlaceholder, toolbarAria, filterByCompanyAria, allCompaniesLabel } = useOffersListLabels();
  const { items: offers, total, loading, error } = useStageOffersByStatus('Active');

  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    offers,
    (r) => [r.title, r.company, r.status, String(r.applicants)],
    (r, f) => r.company === f,
  );

  const companyOptions = useMemo(
    () => [...new Set(offers.map((r) => r.company))].map((c) => ({ value: c, label: c })),
    [offers],
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-active-offers-apps" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.activeOffers.title', { count: total.toLocaleString() })}
        subtitle={pageTitle('dashboard.activeOffers.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder}
        toolbarAriaLabel={toolbarAria('filterActiveOffers')}
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [{ value: 'all', label: allCompaniesLabel }, ...companyOptions],
          ariaLabel: filterByCompanyAria,
        }}
      >
        {error && <p className="px-4 text-sm text-[var(--admin-danger,#dc2626)]">{error}</p>}
        {loading ? <OffersListLoading /> : <ActiveOffersCardContent offers={filtered} />}
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default ActiveInternshipOffersPage;
