import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface DocumentRequestDetailPanelProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  accent?: 'brand' | 'neutral' | 'warning' | 'danger';
}

const DocumentRequestDetailPanel: FunctionComponent<DocumentRequestDetailPanelProps> = ({
  title,
  icon: Icon,
  children,
  className = '',
  accent = 'neutral',
}) => (
  <section className={`admin-doc-detail-panel admin-doc-detail-panel--${accent} ${className}`.trim()}>
    <header className="admin-doc-detail-panel__header">
      <span className="admin-doc-detail-panel__icon" aria-hidden>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <h2 className="admin-doc-detail-panel__title">{title}</h2>
    </header>
    <div className="admin-doc-detail-panel__body">{children}</div>
  </section>
);

export default DocumentRequestDetailPanel;
