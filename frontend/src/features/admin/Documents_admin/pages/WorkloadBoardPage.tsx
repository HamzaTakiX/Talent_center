import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import DocumentsPremiumEmpty from '../components/DocumentsPremiumEmpty';
import DocumentsPageSkeleton from '../components/skeletons/DocumentsPageSkeleton';
import { useDocumentsWorkload } from '../hooks/useDocumentsAdmin';

const WorkloadBoardPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { items: workload, loading, error, refresh } = useDocumentsWorkload();

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.workload.title')}
      subtitle={t('admin.documentsModule.workload.subtitle')}
    >
      {loading ? (
        <DocumentsPageSkeleton />
      ) : error ? (
        <div className="admin-doc-empty">
          <p className="admin-doc-empty__subtitle">{error}</p>
          <button type="button" className="admin-form-btn admin-form-btn--primary mt-4" onClick={refresh}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            {t('admin.documentsModule.hub.retry')}
          </button>
        </div>
      ) : workload.length === 0 ? (
        <DocumentsPremiumEmpty variant="workload" />
      ) : (
        <div className="admin-doc-workload-grid">
          {workload.map((w) => {
            const pct = w.capacity > 0 ? Math.round((w.load / w.capacity) * 100) : 0;
            const state =
              pct >= 90
                ? t('admin.documentsModule.workload.overloaded')
                : pct >= 60
                  ? t('admin.documentsModule.workload.balanced')
                  : t('admin.documentsModule.workload.available');
            return (
              <article key={w.service} className="admin-doc-workload-card">
                <strong>{w.service}</strong>
                <p className="text-xs text-[var(--admin-text-secondary)]">{state}</p>
                <p className="mt-2 text-sm">
                  {w.load} / {w.capacity}
                </p>
                <div className="admin-doc-workload-card__bar">
                  <div className="admin-doc-workload-card__fill" style={{ width: `${pct}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DocumentsSubPageLayout>
  );
};

export default WorkloadBoardPage;
