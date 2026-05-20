import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import DocumentsOverviewHeader from '../components/DocumentsOverviewHeader';
import DocumentsKpiStrip from '../components/DocumentsKpiStrip';
import DocumentsNavStrip from '../components/DocumentsNavStrip';
import DocumentsDashboardCharts from '../components/dashboard/DocumentsDashboardCharts';
import DocumentsRequestsModernTable from '../components/DocumentsRequestsModernTable';
import DocumentsPageSkeleton from '../components/skeletons/DocumentsPageSkeleton';
import { useDocumentsDashboard } from '../hooks/useDocumentsAdmin';
import '../styles/admin-documents.css';

const DocumentsDashboardPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading } = useDocumentsDashboard();

  const handleKpiNavigate = useCallback(
    (key: string) => {
      if (key === 'slaAtRisk') navigate('/admin/documents/requests?status=under_verification');
      else if (key === 'reservationsToday') navigate('/admin/documents/reservations');
      else navigate('/admin/documents/requests');
    },
    [navigate],
  );

  if (loading && !data) {
    return (
      <AdminModulePageShell width="wide">
        <DocumentsPageSkeleton />
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-doc-workspace" data-admin-search-id="documents-hub">
        <DocumentsOverviewHeader summary={data?.summary ?? null} loading={loading} />
        <DocumentsKpiStrip
          summary={data?.summary ?? null}
          loading={loading}
          onNavigate={handleKpiNavigate}
        />
        <DocumentsNavStrip />
        {data ? <DocumentsDashboardCharts data={data} loading={loading} /> : null}
        <section className="admin-doc-recent-section">
          <h2 className="admin-doc-recent-section__title">
            {t('admin.documentsModule.feed.recent')}
          </h2>
          <DocumentsRequestsModernTable rows={data?.recentRequests ?? []} loading={loading} />
        </section>
      </div>
    </AdminModulePageShell>
  );
};

export default DocumentsDashboardPage;
