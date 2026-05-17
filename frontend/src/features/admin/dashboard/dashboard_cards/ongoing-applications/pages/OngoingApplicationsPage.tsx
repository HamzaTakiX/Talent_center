import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import OngoingApplicationsCardContent from '../components/OngoingApplicationsCardContent';
import {
  ONGOING_APPLICATIONS_COUNT,
  ongoingApplicationsMockRows,
} from '../data/ongoingApplicationsMockData';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
] as const;

const OngoingApplicationsPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    ongoingApplicationsMockRows,
    (r) => [r.student, r.offer, r.score, r.status],
    (r, f) => r.status === f,
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-ongoing-funnel" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.ongoingApplications.title', { count: ONGOING_APPLICATIONS_COUNT.toLocaleString('en-US') })}
        subtitle={pageTitle('dashboard.ongoingApplications.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('applications')}
        toolbarAriaLabel="Filter applications"
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [...STATUS_OPTIONS],
          ariaLabel: 'Filter by status',
        }}
      >
        <OngoingApplicationsCardContent rows={filtered} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default OngoingApplicationsPage;

