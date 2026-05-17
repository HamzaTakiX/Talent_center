import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';;
import OffersWithApplicationsListTableContent from '../components/OffersWithApplicationsListTableContent';
import {
  OFFERS_WITH_APPLICATIONS_COUNT,
  offersWithApplicationsRows,
} from '../data/offersWithApplicationsMockData';

const companyOptions = [...new Set(offersWithApplicationsRows.map((r) => r.company))].sort();

const OffersWithApplicationsListPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offersWithApplicationsRows.filter((row) => {
      const matchCompany = companyFilter === 'all' || row.company === companyFilter;
      if (!q) return matchCompany;
      const matchQuery =
        row.title.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);
      return matchCompany && matchQuery;
    });
  }, [query, companyFilter]);

  const totalFormatted = OFFERS_WITH_APPLICATIONS_COUNT.toLocaleString('en-US');
  const companySelectOptions = useMemo(
    () => [{ value: 'all', label: 'All companies' }, ...companyOptions.map((c) => ({ value: c, label: c }))],
    [],
  );

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/internship-offers')}
      backTo="offers"
    >
      <AdminStatChartSection chartId="offers-applications-volume" />
      <AdminStatDetailPanel
        title={pageTitle('offers.withApplications.title', { count: totalFormatted })}
        subtitle={filterSubtitle('offers')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('offers')}
        toolbarAriaLabel="Filter offers with applications"
        filter1={{
          value: companyFilter,
          onChange: setCompanyFilter,
          options: companySelectOptions,
          ariaLabel: 'Filter by company',
        }}
      >
        <OffersWithApplicationsListTableContent offers={filteredRows} />
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default OffersWithApplicationsListPage;
