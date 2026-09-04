import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type AdminModuleHeaderLayout = 'inline' | 'stacked' | 'toolbar';

interface AdminModuleHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  layout?: AdminModuleHeaderLayout;
  className?: string;
  /** Leading icon — same markup/classes as AdminStatChartSection header */
  icon?: LucideIcon;
}

const layoutClass: Record<AdminModuleHeaderLayout, string> = {
  inline: 'admin-module-header--inline',
  stacked: 'admin-module-header--stacked',
  toolbar: 'admin-module-header--toolbar',
};

const AdminModuleHeader: FunctionComponent<AdminModuleHeaderProps> = ({
  title,
  subtitle,
  actions,
  layout = 'inline',
  className = '',
  icon: Icon,
}) => (
  <div className={['admin-module-header', layoutClass[layout], className].filter(Boolean).join(' ')}>
    {Icon ? (
      <div className="admin-module-header__intro">
        <span className="admin-stat-chart-section__icon" aria-hidden>
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="admin-stat-chart-section__copy">
          <h2 className="admin-stat-chart-section__title">{title}</h2>
          {subtitle ? <p className="admin-stat-chart-section__subtitle">{subtitle}</p> : null}
        </div>
      </div>
    ) : (
      <div className="admin-module-header__titles">
        <h2 className="admin-module-title">{title}</h2>
        {subtitle ? <p className="admin-module-subtitle">{subtitle}</p> : null}
      </div>
    )}
    {actions ? <div className="admin-module-header__actions">{actions}</div> : null}
  </div>
);

export default AdminModuleHeader;
