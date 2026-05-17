import { useAdminCopy } from '../../../../i18n/useAdminCopy';
import { FunctionComponent, useMemo } from 'react';
import AdminModulePageShell from '../../../../ui/AdminModulePageShell';
import { AdminStatChartSection } from '../../../../ui';
import BackToDashboardButton from '../../shared/components/BackToDashboardButton';
import DashboardCardDetailPanel from '../../shared/components/DashboardCardDetailPanel';
import { useDashboardCardListFilter } from '../../shared/hooks/useDashboardCardListFilter';
import DocumentsPendingCardContent from '../components/DocumentsPendingCardContent';
import {
  DOCUMENTS_PENDING_COUNT,
  documentsPendingValidationMockRows,
} from '../data/documentsPendingValidationMockData';

const DocumentsPendingValidationPage: FunctionComponent = () => {
  const { pageTitle, filterSubtitle, searchPlaceholder } = useAdminCopy();
  const { query, setQuery, filter, setFilter, filtered } = useDashboardCardListFilter(
    documentsPendingValidationMockRows,
    (r) => [r.documentType, r.student, r.date],
    (r, f) => r.documentType === f,
  );

  const typeOptions = useMemo(
    () =>
      [...new Set(documentsPendingValidationMockRows.map((r) => r.documentType))].map((t) => ({
        value: t,
        label: t,
      })),
    [],
  );

  return (
    <AdminModulePageShell width="default">
      <BackToDashboardButton />
      <AdminStatChartSection chartId="dashboard-documents-pending" />
      <DashboardCardDetailPanel
        title={pageTitle('dashboard.documentsPending.title', { count: DOCUMENTS_PENDING_COUNT.toLocaleString('en-US') })}
        subtitle={pageTitle('dashboard.documentsPending.subtitle')}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder('documents')}
        toolbarAriaLabel="Filter documents"
        filter1={{
          value: filter,
          onChange: setFilter,
          options: [{ value: 'all', label: 'All types' }, ...typeOptions],
          ariaLabel: 'Filter by document type',
        }}
      >
        <DocumentsPendingCardContent rows={filtered} />
      </DashboardCardDetailPanel>
    </AdminModulePageShell>
  );
};

export default DocumentsPendingValidationPage;

