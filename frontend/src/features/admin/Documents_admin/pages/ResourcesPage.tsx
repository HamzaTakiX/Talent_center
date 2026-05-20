import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import DocumentsPremiumEmpty from '../components/DocumentsPremiumEmpty';
import { useAdministrativeResources } from '../hooks/useDocumentsAdmin';

const ResourcesPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { items, loading } = useAdministrativeResources();

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.resources.title')}
      subtitle={t('admin.documentsModule.resources.subtitle')}
    >
      {!loading && items.length === 0 ? (
        <DocumentsPremiumEmpty variant="resources" />
      ) : (
        <div className="admin-doc-workload-grid">
          {items.map((r) => (
            <article key={r.id} className="admin-doc-workload-card">
              <strong>{r.name}</strong>
              <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">
                {r.location} · {r.resourceType}
              </p>
              <div className="admin-doc-workload-card__bar">
                <div
                  className="admin-doc-workload-card__fill"
                  style={{ width: `${r.occupancyPercent}%` }}
                />
              </div>
              <span className="mt-1 text-xs font-medium">{r.occupancyPercent}%</span>
            </article>
          ))}
        </div>
      )}
    </DocumentsSubPageLayout>
  );
};

export default ResourcesPage;
