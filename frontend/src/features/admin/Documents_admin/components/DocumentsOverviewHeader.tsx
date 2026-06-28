import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Sparkles } from 'lucide-react';
import AdminPageHero from '../../ui/AdminPageHero';

interface Props {
  activeRequests?: number;
  loading?: boolean;
}

const DocumentsOverviewHeader: FunctionComponent<Props> = ({ activeRequests, loading }) => {
  const { t } = useTranslation();

  return (
    <AdminPageHero
      className="admin-doc-hub-hero"
      icon={FileText}
      badge={
        <span className="admin-doc-hub-hero__badge">
          <Sparkles className="h-3 w-3" aria-hidden />
          {t('admin.documentsModule.hero.badge')}
        </span>
      }
      title={t('admin.documentsModule.hub.title')}
      subtitle={t('admin.documentsModule.hub.subtitle')}
      action={
        loading ? (
          <div className="admin-doc-hub-hero__pipeline-skeleton admin-shimmer" aria-hidden />
        ) : activeRequests != null ? (
          <div className="admin-doc-hub-hero__pipeline" role="status">
            <span className="admin-doc-hub-hero__pipeline-dot" aria-hidden />
            <span className="admin-doc-hub-hero__pipeline-label">
              {t('admin.documentsModule.hero.pipeline')}
            </span>
            <strong className="admin-doc-hub-hero__pipeline-value">{activeRequests}</strong>
          </div>
        ) : null
      }
    />
  );
};

export default DocumentsOverviewHeader;
