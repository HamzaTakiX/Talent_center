import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, FileText } from 'lucide-react';
import type { ResolvedDocumentCatalogItem } from '../types';
import { DOCUMENT_REQUEST_BTN, DOCUMENT_SURFACE_CARD } from '../constants/documentsStyles';
import DocumentCatalogBadge from './DocumentCatalogBadge';
import { STUDENT_ICON_CHIP_INFO } from '../../design-system/studentSemanticStyles';

interface DocumentCatalogCardProps {
  item: ResolvedDocumentCatalogItem;
  onRequest?: (id: string) => void;
}

const DocumentCatalogCard: FunctionComponent<DocumentCatalogCardProps> = ({ item, onRequest }) => {
  const { t } = useTranslation();

  return (
    <article className={`student-document-catalog-card ${DOCUMENT_SURFACE_CARD}`}>
      <header className="student-document-catalog-card__header">
        <div className="student-document-catalog-card__titles min-w-0 flex-1">
          <h3 className="student-document-catalog-card__title" dir="auto">
            {item.title}
          </h3>
          <p className="student-document-catalog-card__category" dir="auto">
            {item.category}
          </p>
        </div>
        <span
          className={`student-document-catalog-card__icon inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${STUDENT_ICON_CHIP_INFO}`}
          aria-hidden
        >
          <FileText className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </header>

      <div className="student-document-catalog-card__meta">
        <p className="student-document-catalog-card__delay">
          <Clock className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span dir="auto">{item.delayLabel}</span>
        </p>
        <p className="student-document-catalog-card__requirement" dir="auto">
          {item.requirement}
        </p>
        <div className="student-document-catalog-card__badge">
          <DocumentCatalogBadge type={item.badgeType} />
        </div>
      </div>

      <footer className="student-document-catalog-card__footer">
        <button type="button" className={DOCUMENT_REQUEST_BTN} onClick={() => onRequest?.(item.id)}>
          {t('student.documents.requestBtn')}
        </button>
      </footer>
    </article>
  );
};

export default DocumentCatalogCard;
