import { FunctionComponent } from 'react';
import { Calendar, Zap } from 'lucide-react';
import type { DocumentCatalogBadgeType } from '../types';

interface DocumentCatalogBadgeProps {
  type: DocumentCatalogBadgeType;
}

const DocumentCatalogBadge: FunctionComponent<DocumentCatalogBadgeProps> = ({ type }) => {
  if (type === 'auto') {
    return (
      <span className="inline-flex w-fit max-w-full items-center gap-1 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-0.5 text-xs font-semibold leading-none text-[#15803d]">
        <Zap className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        Auto génération
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit max-w-full items-center gap-1 rounded-full border border-[#e5e7eb] bg-[var(--admin-surface-muted)] px-2.5 py-0.5 text-xs font-semibold leading-none text-[#6b7280]">
      <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      Réservation requise
    </span>
  );
};

export default DocumentCatalogBadge;
