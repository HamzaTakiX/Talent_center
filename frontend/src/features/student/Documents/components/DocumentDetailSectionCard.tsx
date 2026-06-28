import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface DocumentDetailSectionCardProps {
  id?: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

const DocumentDetailSectionCard: FunctionComponent<DocumentDetailSectionCardProps> = ({
  id,
  title,
  icon: Icon,
  children,
  className = '',
}) => (
  <section
    id={id}
    className={`student-document-detail-page__card ${className}`.trim()}
    aria-labelledby={id ? `${id}-title` : undefined}
  >
    <header className="student-document-detail-page__card-header">
      <span className="student-document-detail-page__card-icon" aria-hidden>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <h2 id={id ? `${id}-title` : undefined} className="student-document-detail-page__card-title">
        {title}
      </h2>
    </header>
    <div className="student-document-detail-page__card-body">{children}</div>
  </section>
);

export default DocumentDetailSectionCard;
