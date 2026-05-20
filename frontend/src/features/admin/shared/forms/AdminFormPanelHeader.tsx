import { FunctionComponent, ReactNode } from 'react';

interface AdminFormPanelHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/** En-tête fixe du panneau formulaire (même style que admin-module-header). */
const AdminFormPanelHeader: FunctionComponent<AdminFormPanelHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <header className="admin-form-panel-header admin-module-header admin-module-header--stacked w-full shrink-0">
    <div className="admin-module-header__titles">
      <h1 className="admin-module-title text-lg sm:text-xl">{title}</h1>
      {subtitle ? <p className="admin-module-subtitle">{subtitle}</p> : null}
    </div>
    {action ? <div className="admin-module-header__actions">{action}</div> : null}
  </header>
);

export default AdminFormPanelHeader;
