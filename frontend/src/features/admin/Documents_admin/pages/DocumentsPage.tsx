import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { documentRequestsMockData } from '../data/documentRequestsMockData';
import DocumentsStats from '../Documents_cards/components/DocumentsStats';
import DocumentsRequestsTable from '../components/DocumentsRequestsTable';

const DocumentsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documentRequestsMockData;
    return documentRequestsMockData.filter(
      (row) =>
        row.documentType.toLowerCase().includes(q) ||
        row.studentName.toLowerCase().includes(q) ||
        row.submissionDate.includes(q) ||
        row.status.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <AdminModulePageShell width="wide">
      <div data-admin-search-id="documents-stats">
        <DocumentsStats />
      </div>
      <div data-admin-search-id="documents-table">
      <DocumentsRequestsTable
        rows={filteredRows}
        query={query}
        onQueryChange={setQuery}
        title={t('admin.modules.documents.title')}
        subtitle={t('admin.modules.documents.subtitle')}
      />
      </div>
    </AdminModulePageShell>
  );
};

export default DocumentsPage;
