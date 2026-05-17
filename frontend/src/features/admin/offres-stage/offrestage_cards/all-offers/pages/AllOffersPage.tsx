import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection } from '../../../../ui';;
import AllOffersTableContent from '../components/AllOffersTableContent';
import {
  ALL_OFFERS_COUNT,
  allOffersRows,
  type AllOffersStatus,
} from '../data/allOffersMockData';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Closed', label: 'Closed' },
] as const;

const AllOffersPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AllOffersStatus>('all');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOffersRows.filter((row) => {
      const matchStatus = statusFilter === 'all' || row.status === statusFilter;
      if (!q) return matchStatus;
      const matchQuery =
        row.title.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [query, statusFilter]);

  const totalFormatted = ALL_OFFERS_COUNT.toLocaleString('en-US');

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/internship-offers')}
      backTo="offers"
    >
      <AdminStatChartSection chartId="offers-all-status" />
      <AdminStatDetailPanel
        title={pageTitle('offers.all.title', { count: totalFormatted })}
        subtitle={filterSubtitle('offers')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('offers')}
        toolbarAriaLabel="Filter all offers"
        filter1={{
          value: statusFilter,
          onChange: (v) => setStatusFilter(v as 'all' | AllOffersStatus),
          options: [...STATUS_OPTIONS],
          ariaLabel: 'Filter by status',
        }}
      >
        <AllOffersTableContent offers={filteredRows} />
      </AdminStatDetailPanel>
    </AdminListPageShell>
  );
};

export default AllOffersPage;
