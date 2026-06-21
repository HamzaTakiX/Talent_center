import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';
import AllOffersTableContent from '../components/AllOffersTableContent';
import { useStageOffersByStatus } from '../../../hooks/useStageOffers';
import type { InternshipOffer } from '../../../types';
import OffersListLoading from '../../../components/OffersListLoading';
import { useOffersListLabels } from '../../../hooks/useOffersListLabels';

const AllOffersPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle } = useAdminCopy();
  const { searchPlaceholder, statusFilterOptions, toolbarAria, filterByStatusAria } = useOffersListLabels();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InternshipOffer['status']>('all');

  const { items: filteredRows, total, loading, error, refresh } = useStageOffersByStatus(statusFilter, query);

  const totalFormatted = useMemo(() => total.toLocaleString(), [total]);

  return (
    <AdminListPageShell onBack={() => navigate('/admin/internship-offers')} backTo="offers">
      <AdminStatChartSection chartId="offers-all-status" />
      <AdminStatDetailPanel
        title={pageTitle('offers.all.title', { count: totalFormatted })}
        subtitle={filterSubtitle('offers')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder}
        toolbarAriaLabel={toolbarAria('filterAllOffers')}
        filter1={{
          value: statusFilter,
          onChange: (v) => setStatusFilter(v as 'all' | InternshipOffer['status']),
          options: statusFilterOptions,
          ariaLabel: filterByStatusAria,
        }}
      >
        {error && <p className="px-4 text-sm text-[var(--admin-danger,#dc2626)]">{error}</p>}
        {loading ? <OffersListLoading /> : <AllOffersTableContent offers={filteredRows} onRefresh={refresh} />}
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default AllOffersPage;
