import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import StudentsUnpaidSrfCardContent from '../components/StudentsUnpaidSrfCardContent';
import { STUDENTS_UNPAID_SRF_COUNT, studentsUnpaidSrfMockRows } from '../data/studentsUnpaidSrfMockData';

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partially_paid', label: 'Partially paid' },
] as const;

const StudentsUnpaidSrfPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    studentsUnpaidSrfMockRows,
    (r) => [r.name, r.classLevel, r.amountDue, r.status],
    (r, f) => r.status === f,
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-srf-unpaid" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.unpaidSrf.title', { count: STUDENTS_UNPAID_SRF_COUNT.toLocaleString('en-US') })}
        subtitle={pageTitle('dashboard.unpaidSrf.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('students')}
        toolbarAriaLabel="Filter students"
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [...PAYMENT_STATUS_OPTIONS],
          ariaLabel: 'Filter by payment status',
        }}
      >
        <StudentsUnpaidSrfCardContent rows={filtered} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default StudentsUnpaidSrfPage;

