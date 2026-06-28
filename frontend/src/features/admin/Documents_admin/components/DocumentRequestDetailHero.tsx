import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarClock, FileText, Hash, Layers, Truck } from 'lucide-react';
import DocumentsStatusBadge from './DocumentsStatusBadge';
import type { DocumentRequestDetail } from '../types';

interface DocumentRequestDetailHeroProps {
  data: DocumentRequestDetail;
}

function formatDateTime(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DocumentRequestDetailHero: FunctionComponent<DocumentRequestDetailHeroProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="admin-doc-detail-hero">
      <div className="admin-doc-detail-hero__accent" aria-hidden />
      <div className="admin-doc-detail-hero__inner">
        <div className="admin-doc-detail-hero__main">
          <p className="admin-doc-detail-hero__eyebrow">{t('admin.documentsModule.detail.title')}</p>
          <div className="admin-doc-detail-hero__title-row">
            <h1 className="admin-doc-detail-hero__title">{data.reference}</h1>
            <DocumentsStatusBadge status={data.status} />
          </div>
          <p className="admin-doc-detail-hero__subtitle">
            <FileText className="h-4 w-4 shrink-0" aria-hidden />
            <span>{data.documentTypeName}</span>
            <span className="admin-doc-detail-hero__dot" aria-hidden />
            <code>{data.documentTypeCode}</code>
          </p>
          <dl className="admin-doc-detail-hero__meta">
            <div className="admin-doc-detail-hero__meta-item">
              <dt>
                <Hash className="h-3.5 w-3.5" aria-hidden />
                {t('admin.documentsModule.detail.service')}
              </dt>
              <dd>{data.serviceName}</dd>
            </div>
            <div className="admin-doc-detail-hero__meta-item">
              <dt>
                <Truck className="h-3.5 w-3.5" aria-hidden />
                {t('admin.documentsModule.detail.delivery')}
              </dt>
              <dd>{t(`admin.documentsModule.delivery.${data.deliveryMethod}`, data.deliveryMethod)}</dd>
            </div>
            <div className="admin-doc-detail-hero__meta-item">
              <dt>
                <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                {t('admin.documentsModule.detail.submittedAt')}
              </dt>
              <dd>{formatDateTime(data.submittedAt)}</dd>
            </div>
            <div className="admin-doc-detail-hero__meta-item">
              <dt>
                <Layers className="h-3.5 w-3.5" aria-hidden />
                {t('admin.documentsModule.detail.priority')}
              </dt>
              <dd>{t(`admin.documentsModule.priority.${data.priority}`, data.priority)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequestDetailHero;
