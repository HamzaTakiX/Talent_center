import { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';

interface SrfSectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  liveCount?: number;
  loading?: boolean;
}

const SrfSectionHeader: FunctionComponent<SrfSectionHeaderProps> = ({
  title,
  subtitle,
  actions,
  liveCount,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="admin-srf-section-header admin-module-header admin-module-header--toolbar">
      <div className="admin-srf-section-header__intro">
        <div className="admin-srf-section-header__icon" aria-hidden>
          <Wallet className="size-5" strokeWidth={1.75} />
        </div>
        <div className="admin-srf-section-header__copy">
          <h2 className="admin-module-title admin-srf-section-header__title">{title}</h2>
          {subtitle ? (
            <p className="admin-module-subtitle admin-srf-section-header__subtitle">{subtitle}</p>
          ) : null}
          <div className="admin-srf-section-header__badge-row">
            {loading ? (
              <span className="admin-srf-live-badge admin-srf-live-badge--loading admin-shimmer" aria-hidden />
            ) : liveCount != null ? (
              <span className="admin-srf-live-badge" role="status">
                <span className="admin-srf-live-badge__dot" aria-hidden />
                {t('admin.modules.srf.dashboard.liveStatus', { count: liveCount })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {actions ? <div className="admin-module-header__actions">{actions}</div> : null}
    </div>
  );
};

export default SrfSectionHeader;
