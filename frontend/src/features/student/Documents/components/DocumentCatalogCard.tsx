import { FunctionComponent } from 'react';
import { Clock, FileText } from 'lucide-react';
import type { DocumentCatalogItem } from '../types';
import { DOCUMENT_REQUEST_BTN, DOCUMENT_SURFACE_CARD } from '../constants/documentsStyles';
import DocumentCatalogBadge from './DocumentCatalogBadge';

interface DocumentCatalogCardProps {
  item: DocumentCatalogItem;
  onRequest?: (id: string) => void;
}

const DocumentCatalogCard: FunctionComponent<DocumentCatalogCardProps> = ({ item, onRequest }) => (
  <article className={`${DOCUMENT_SURFACE_CARD} min-h-[240px] gap-3 p-4 sm:min-h-[260px] sm:p-5`}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-base font-semibold leading-snug text-[var(--admin-text)] sm:text-[17px]">
          {item.title}
        </h3>
        <p className="mt-1 text-sm font-medium text-[var(--admin-text-muted)]">{item.category}</p>
      </div>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eff6ff] text-[#2563eb]">
        <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
    </div>

    <p className="m-0 inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-[#6b7280]">
      <Clock className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <span>{item.delayLabel}</span>
    </p>

    <p className="m-0 flex-1 text-sm leading-relaxed text-[#6b7280]">{item.requirement}</p>

    <DocumentCatalogBadge type={item.badgeType} />

    <button
      type="button"
      className={DOCUMENT_REQUEST_BTN}
      onClick={() => onRequest?.(item.id)}
    >
      Demander ce document
    </button>
  </article>
);

export default DocumentCatalogCard;
