import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminFormPanelHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  leading?: ReactNode;
}

/** En-tête fixe du panneau formulaire (même style que admin-module-header). */
const AdminFormPanelHeader: FunctionComponent<AdminFormPanelHeaderProps> = ({
  title,
  subtitle,
  action,
  icon: Icon,
  leading,
}) => (
  <header
    className={`admin-form-panel-header admin-module-header w-full shrink-0 ${
      leading || !Icon ? 'admin-module-header--stacked' : 'items-center'
    }`}
  >
    {leading}
    {Icon ? (
      <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-x-3 gap-y-1">
        <span className="admin-stat-chart-section__icon !mt-0" aria-hidden>
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h1 className="admin-module-title text-lg sm:text-xl">{title}</h1>
          {subtitle ? <p className="admin-module-subtitle">{subtitle}</p> : null}
        </div>
      </div>
    ) : (
      <div className="admin-module-header__titles">
        <h1 className="admin-module-title text-lg sm:text-xl">{title}</h1>
        {subtitle ? <p className="admin-module-subtitle">{subtitle}</p> : null}
      </div>
    )}
    {action ? <div className="admin-module-header__actions shrink-0">{action}</div> : null}
  </header>
);

export default AdminFormPanelHeader;
