import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import DocumentsPremiumEmpty from '../components/DocumentsPremiumEmpty';
import { MOCK_DASHBOARD } from '../data/documentsMockData';

const WorkloadBoardPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const workload = MOCK_DASHBOARD.serviceWorkload;

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.workload.title')}
      subtitle={t('admin.documentsModule.workload.subtitle')}
    >
      {workload.length === 0 ? (
        <DocumentsPremiumEmpty variant="workload" />
      ) : (
        <div className="admin-doc-workload-grid">
          {workload.map((w) => {
            const pct = Math.round((w.load / w.capacity) * 100);
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
