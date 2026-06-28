import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

export type DocumentDetailMessageVariant = 'danger' | 'warning' | 'info' | 'success';

interface DocumentDetailMessageBannerProps {
  variant: DocumentDetailMessageVariant;
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
  compact?: boolean;
}

const DEFAULT_ICONS: Record<DocumentDetailMessageVariant, LucideIcon> = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const DocumentDetailMessageBanner: FunctionComponent<DocumentDetailMessageBannerProps> = ({
  variant,
  title,
  children,
  icon,
  compact = false,
}) => {
  const Icon = icon ?? DEFAULT_ICONS[variant];

  return (
    <div
      role={variant === 'success' ? 'status' : 'alert'}
      className={`student-document-detail-page__feedback student-document-detail-page__feedback--${variant}${
        compact ? ' student-document-detail-page__feedback--compact' : ''
      }`}
    >
      <span className="student-document-detail-page__feedback-icon" aria-hidden>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="student-document-detail-page__feedback-body">
        {title ? <p className="student-document-detail-page__feedback-title">{title}</p> : null}
        <p className="student-document-detail-page__feedback-text">{children}</p>
      </div>
    </div>
  );
};

export default DocumentDetailMessageBanner;
