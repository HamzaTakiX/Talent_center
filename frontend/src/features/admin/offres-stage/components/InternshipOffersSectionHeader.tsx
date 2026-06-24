import { FunctionComponent, ReactNode } from 'react';
import { Briefcase, FilePenLine, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type InternshipOffersSectionVariant = 'offers' | 'drafts';

const variantConfig: Record<InternshipOffersSectionVariant, { icon: LucideIcon }> = {
  offers: { icon: Briefcase },
  drafts: { icon: FilePenLine },
};

interface InternshipOffersSectionHeaderProps {
  variant: InternshipOffersSectionVariant;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  itemCount?: number;
  loading?: boolean;
}

const InternshipOffersSectionHeader: FunctionComponent<InternshipOffersSectionHeaderProps> = ({
  variant,
  title,
  subtitle,
  actions,
  itemCount,
  loading = false,
}) => {
  const { t } = useTranslation();
  const { icon: Icon } = variantConfig[variant];
  const showCount = !loading && itemCount != null;

  return (
    <div className="admin-offers-section-header admin-module-header admin-module-header--toolbar">
      <div className="admin-offers-section-header__intro">
        <div className="admin-offers-section-header__icon" aria-hidden>
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="admin-offers-section-header__copy">
          <div className="admin-offers-section-header__title-row">
            <h2 className="admin-module-title admin-offers-section-header__title">{title}</h2>
            {showCount ? (
              <span className="admin-offers-section-header__count" aria-label={t('admin.modules.offers.section.countAria', { count: itemCount })}>
                {itemCount}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="admin-module-subtitle admin-offers-section-header__subtitle">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="admin-module-header__actions">{actions}</div> : null}
    </div>
  );
};

export default InternshipOffersSectionHeader;
