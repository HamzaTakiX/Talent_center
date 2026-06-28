import { FunctionComponent, ReactNode } from 'react';
import { BarChart3, ClipboardList, type LucideIcon } from 'lucide-react';

type DocumentsSectionVariant = 'recent' | 'analytics';

const variantConfig: Record<DocumentsSectionVariant, { icon: LucideIcon }> = {
  recent: { icon: ClipboardList },
  analytics: { icon: BarChart3 },
};

interface DocumentsSectionHeaderProps {
  variant: DocumentsSectionVariant;
  title: string;
  subtitle?: string;
  itemCount?: number;
  loading?: boolean;
  actions?: ReactNode;
}

const DocumentsSectionHeader: FunctionComponent<DocumentsSectionHeaderProps> = ({
  variant,
  title,
  subtitle,
  itemCount,
  loading = false,
  actions,
}) => {
  const { icon: Icon } = variantConfig[variant];
  const showCount = !loading && itemCount != null;

  return (
    <div className="admin-doc-section-header admin-module-header admin-module-header--toolbar">
      <div className="admin-doc-section-header__intro">
        <div className="admin-doc-section-header__icon" aria-hidden>
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </div>
        <div className="admin-doc-section-header__copy">
          <div className="admin-doc-section-header__title-row">
            <h2 className="admin-module-title admin-doc-section-header__title">{title}</h2>
            {showCount ? (
              <span className="admin-doc-section-header__count">{itemCount}</span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="admin-module-subtitle admin-doc-section-header__subtitle">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="admin-module-header__actions">{actions}</div> : null}
    </div>
  );
};

export default DocumentsSectionHeader;
