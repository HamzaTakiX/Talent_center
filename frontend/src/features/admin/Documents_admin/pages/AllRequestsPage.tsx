import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../ui';
import DocumentsNavStrip from '../components/DocumentsNavStrip';
import DocumentsFiltersBar, { type DocFilters } from '../components/DocumentsFiltersBar';
import DocumentsRequestsModernTable from '../components/DocumentsRequestsModernTable';
import DocumentsPremiumEmpty from '../components/DocumentsPremiumEmpty';
import { useDocumentsRequestsList } from '../hooks/useDocumentsAdmin';
import '../styles/admin-documents.css';

const AllRequestsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DocFilters>({});
  const params = useMemo(
    () => ({ page: 1, page_size: 20, search: filters.search, status: filters.status }),
    [filters],
  );
  const { items, loading, total } = useDocumentsRequestsList(params);
  const hasFilters = Boolean(filters.search || filters.status);

  return (
    <AdminListPageShell onBack={() => navigate('/admin/documents')} backTo="documents">
      <div className="admin-doc-workspace">
        <header className="admin-doc-hero admin-doc-hero--compact">
          <h1 className="admin-doc-hero__title">{t('admin.documentsModule.requests.title')}</h1>
          <p className="admin-doc-hero__subtitle">{t('admin.documentsModule.requests.subtitle')}</p>
        </header>
        <DocumentsNavStrip />
        <DocumentsFiltersBar filters={filters} onChange={setFilters} />
        {!loading && items.length === 0 ? (
          <DocumentsPremiumEmpty variant={hasFilters ? 'search' : 'requests'} />
        ) : (
          <DocumentsRequestsModernTable rows={items} loading={loading} />
        )}
        {total > 0 && (
          <p className="text-sm text-[var(--admin-text-secondary)]">
            {total} {t('admin.documentsModule.table.reference').toLowerCase()}
          </p>
        )}
      </div>
    </AdminListPageShell>
  );
};

export default AllRequestsPage;
