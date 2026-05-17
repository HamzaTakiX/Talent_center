import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';;
import ExpiredOffersListTableContent from '../components/ExpiredOffersListTableContent';
import {
  EXPIRED_OFFERS_LIST_COUNT,
  expiredOffersOnlyRows,
} from '../data/expiredOffersOnlyMockData';

const companyOptions = [...new Set(expiredOffersOnlyRows.map((r) => r.company))].sort();

const ExpiredOffersListPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expiredOffersOnlyRows.filter((row) => {
      const matchCompany = companyFilter === 'all' || row.company === companyFilter;
      if (!q) return matchCompany;
      const matchQuery =
        row.title.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);
      return matchCompany && matchQuery;
    });
  }, [query, companyFilter]);

  const totalFormatted = EXPIRED_OFFERS_LIST_COUNT.toLocaleString('en-US');
  const companySelectOptions = useMemo(
    () => [{ value: 'all', label: 'All companies' }, ...companyOptions.map((c) => ({ value: c, label: c }))],
    [],
  );

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/internship-offers')}
      backTo="offers"
    >
      <AdminStatChartSection chartId="offers-expired-timeline" />
      <AdminStatDetailPanel
        title={pageTitle('offers.expired.title', { count: totalFormatted })}
        subtitle={filterSubtitle('offers')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('offers')}
        toolbarAriaLabel="Filter expired offers"
        filter1={{
          value: companyFilter,
          onChange: setCompanyFilter,
          options: companySelectOptions,
          ariaLabel: 'Filter by company',
        }}
      >
        <ExpiredOffersListTableContent offers={filteredRows} />
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default ExpiredOffersListPage;
