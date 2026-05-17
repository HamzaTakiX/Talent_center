import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';;
import DraftOffersListTableContent from '../components/DraftOffersListTableContent';
import { DRAFT_OFFERS_LIST_COUNT, draftOffersOnlyRows } from '../data/draftOffersOnlyMockData';

const companyOptions = [...new Set(draftOffersOnlyRows.map((r) => r.company))].sort();

const DraftOffersListPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return draftOffersOnlyRows.filter((row) => {
      const matchCompany = companyFilter === 'all' || row.company === companyFilter;
      if (!q) return matchCompany;
      const matchQuery =
        row.title.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);
      return matchCompany && matchQuery;
    });
  }, [query, companyFilter]);

  const totalFormatted = DRAFT_OFFERS_LIST_COUNT.toLocaleString('en-US');
  const companySelectOptions = useMemo(
    () => [{ value: 'all', label: 'All companies' }, ...companyOptions.map((c) => ({ value: c, label: c }))],
    [],
  );

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/internship-offers')}
      backTo="offers"
    >
      <AdminStatChartSection chartId="offers-draft-monthly" />
      <AdminStatDetailPanel
        title={pageTitle('offers.draft.title', { count: totalFormatted })}
        subtitle={filterSubtitle('offers')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('offers')}
        toolbarAriaLabel="Filter draft offers"
        filter1={{
          value: companyFilter,
          onChange: setCompanyFilter,
          options: companySelectOptions,
          ariaLabel: 'Filter by company',
        }}
      >
        <DraftOffersListTableContent offers={filteredRows} />
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default DraftOffersListPage;
