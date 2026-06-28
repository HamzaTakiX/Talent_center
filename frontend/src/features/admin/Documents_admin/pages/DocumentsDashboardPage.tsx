import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
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
  const { data, loading, error, refresh } = useDocumentsDashboard();

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

  if (error && !data) {
    return (
      <AdminModulePageShell width="wide">
        <div className="admin-doc-workspace admin-doc-workspace--error">
          <div className="admin-doc-error-state">
            <h3 className="admin-doc-error-state__title">{t('admin.documentsModule.hub.loadError')}</h3>
            <p className="admin-doc-error-state__subtitle">{error}</p>
            <button type="button" className="admin-form-btn admin-form-btn--primary mt-4" onClick={refresh}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              {t('admin.documentsModule.hub.retry')}
            </button>
          </div>
        </div>
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-doc-workspace admin-doc-workspace--hub" data-admin-search-id="documents-hub">
        <DocumentsOverviewHeader
          activeRequests={data?.summary?.activeRequests}
          loading={loading}
        />
        <DocumentsKpiStrip
          summary={data?.summary ?? null}
          loading={loading}
          onNavigate={handleKpiNavigate}
        />
        <DocumentsNavStrip />
        {data ? <DocumentsDashboardCharts data={data} loading={loading} /> : null}
        <DocumentsRequestsModernTable rows={data?.recentRequests ?? []} loading={loading} />
      </div>
    </AdminModulePageShell>
  );
};

export default DocumentsDashboardPage;
