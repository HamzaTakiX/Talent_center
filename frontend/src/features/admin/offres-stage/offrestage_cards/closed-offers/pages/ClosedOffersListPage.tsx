import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';;
import ClosedOffersListTableContent from '../components/ClosedOffersListTableContent';
import { CLOSED_OFFERS_LIST_COUNT, closedOffersOnlyRows } from '../data/closedOffersOnlyMockData';

const companyOptions = [...new Set(closedOffersOnlyRows.map((r) => r.company))].sort();

const ClosedOffersListPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return closedOffersOnlyRows.filter((row) => {
      const matchCompany = companyFilter === 'all' || row.company === companyFilter;
      if (!q) return matchCompany;
      const matchQuery =
        row.title.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);
      return matchCompany && matchQuery;
    });
  }, [query, companyFilter]);

  const totalFormatted = CLOSED_OFFERS_LIST_COUNT.toLocaleString('en-US');
  const companySelectOptions = useMemo(
    () => [{ value: 'all', label: 'All companies' }, ...companyOptions.map((c) => ({ value: c, label: c }))],
    [],
  );

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/internship-offers')}
      backTo="offers"
    >
      <AdminStatChartSection chartId="offers-closed-reasons" />
      <AdminStatDetailPanel
        title={pageTitle('offers.closed.title', { count: totalFormatted })}
        subtitle={filterSubtitle('offers')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('offers')}
        toolbarAriaLabel="Filter closed offers"
        filter1={{
          value: companyFilter,
          onChange: setCompanyFilter,
          options: companySelectOptions,
          ariaLabel: 'Filter by company',
        }}
      >
        <ClosedOffersListTableContent offers={filteredRows} />
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default ClosedOffersListPage;
