import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';
import OffersWithApplicationsListTableContent from '../components/OffersWithApplicationsListTableContent';
import { useStageOffersByStatus } from '../../../hooks/useStageOffers';
import OffersListLoading from '../../../components/OffersListLoading';
import { useOffersListLabels } from '../../../hooks/useOffersListLabels';

const OffersWithApplicationsListPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle } = useAdminCopy();
  const { searchPlaceholder, toolbarAria, filterByCompanyAria, allCompaniesLabel } = useOffersListLabels();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  const { items: allRows, total, loading, error, refresh } = useStageOffersByStatus('all', query);

  const filteredRows = useMemo(() => {
    const withApps = allRows.filter((row) => row.applicants > 0);
    return withApps.filter((row) => companyFilter === 'all' || row.company === companyFilter);
  }, [allRows, companyFilter]);

  const companySelectOptions = useMemo(() => {
    const companies = [...new Set(allRows.filter((r) => r.applicants > 0).map((r) => r.company))].sort();
    return [{ value: 'all', label: allCompaniesLabel }, ...companies.map((c) => ({ value: c, label: c }))];
  }, [allRows, allCompaniesLabel]);

  const totalFormatted = filteredRows.length.toLocaleString();

  return (
    <AdminListPageShell onBack={() => navigate('/admin/internship-offers')} backTo="offers">
      <AdminStatChartSection chartId="offers-applications-volume" />
      <AdminStatDetailPanel
        title={pageTitle('offers.withApplications.title', { count: totalFormatted })}
        subtitle={filterSubtitle('offers')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder}
        toolbarAriaLabel={toolbarAria('filterOffersWithApplications')}
        filter1={{
          value: companyFilter,
          onChange: setCompanyFilter,
          options: companySelectOptions,
          ariaLabel: filterByCompanyAria,
        }}
      >
        {error && <p className="px-4 text-sm text-[var(--admin-danger,#dc2626)]">{error}</p>}
        {loading ? (
          <OffersListLoading />
        ) : (
          <OffersWithApplicationsListTableContent offers={filteredRows} onRefresh={refresh} />
        )}
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default OffersWithApplicationsListPage;
