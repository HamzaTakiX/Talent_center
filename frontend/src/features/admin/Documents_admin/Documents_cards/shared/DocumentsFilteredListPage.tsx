import { FunctionComponent, ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminStatChartSection, type StatPageChartId } from '../../../ui';
import type { DocumentRequestStatus } from '../../types';
import { documentRequestsMockData } from '../../data/documentRequestsMockData';
import DocumentsRequestsTable from '../../components/DocumentsRequestsTable';

export type DocumentsListStatusFilter =
  | 'all'
  | DocumentRequestStatus
  | 'Pending'
  | 'Validated'
  | 'Rejected';

interface DocumentsFilteredListPageProps {
  statusFilter: DocumentsListStatusFilter;
  overviewCards: ReactNode;
  chartId?: StatPageChartId;
}

const DocumentsFilteredListPage: FunctionComponent<DocumentsFilteredListPageProps> = ({
  statusFilter,
  overviewCards,
  chartId,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredRows = useMemo(() => {
    const base =
      statusFilter === 'all'
        ? documentRequestsMockData
        : documentRequestsMockData.filter((r) => r.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((row) => {
      const cls = row.studentClass?.toLowerCase() ?? '';
      return (
        row.documentType.toLowerCase().includes(q) ||
        row.studentName.toLowerCase().includes(q) ||
        cls.includes(q) ||
        row.submissionDate.includes(q) ||
        row.status.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter]);

  return (
    <AdminListPageShell
      onBack={() => navigate('/admin/documents')}
      backTo="documents"
    >
      {chartId ? <AdminStatChartSection chartId={chartId} /> : null}
      {overviewCards}
      <DocumentsRequestsTable
        rows={filteredRows}
        query={query}
        onQueryChange={setQuery}
        compactHeader
      />
    </AdminListPageShell>
  );
};

export default DocumentsFilteredListPage;
