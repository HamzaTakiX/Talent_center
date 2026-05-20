import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Sparkles } from 'lucide-react';
import type { DocumentsDashboardData } from '../types';

interface Props {
  summary: DocumentsDashboardData['summary'] | null;
  loading?: boolean;
}

const DocumentsOverviewHeader: FunctionComponent<Props> = ({ summary, loading }) => {
  const { t } = useTranslation();

  return (
    <header className="admin-doc-hero">
      <div className="admin-doc-hero__content">
        <span className="admin-doc-hero__badge">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {t('admin.documentsModule.hero.badge')}
        </span>
        <h1 className="admin-doc-hero__title">{t('admin.documentsModule.hub.title')}</h1>
        <p className="admin-doc-hero__subtitle">{t('admin.documentsModule.hub.subtitle')}</p>
      </div>
      <div className="admin-doc-hero__aside">
        <div className="admin-doc-hero__icon-ring">
          <FileText className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>
        {!loading && summary ? (
          <div className="admin-doc-hero__pipeline">
            <span className="admin-doc-hero__pipeline-dot" />
            {t('admin.documentsModule.hero.pipeline')}
            <strong>{summary.activeRequests}</strong>
          </div>
        ) : (
          <div className="admin-doc-hero__skeleton" />
        )}
      </div>
    </header>
  );
};

export default DocumentsOverviewHeader;
