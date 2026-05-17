import { FunctionComponent, ReactNode } from 'react';

export type AdminModuleHeaderLayout = 'inline' | 'stacked' | 'toolbar';

interface AdminModuleHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  layout?: AdminModuleHeaderLayout;
  className?: string;
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
}) => (
  <div className={['admin-module-header', layoutClass[layout], className].filter(Boolean).join(' ')}>
    <div className="admin-module-header__titles">
      <h2 className="admin-module-title">{title}</h2>
      {subtitle && <p className="admin-module-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="admin-module-header__actions">{actions}</div>}
  </div>
);

export default AdminModuleHeader;
