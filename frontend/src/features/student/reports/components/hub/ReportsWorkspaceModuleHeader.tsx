import { FunctionComponent, ReactNode } from 'react';

interface ReportsWorkspaceModuleHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  icon?: ReactNode;
}

const ReportsWorkspaceModuleHeader: FunctionComponent<ReportsWorkspaceModuleHeaderProps> = ({
  title,
  subtitle,
  badge,
  icon,
}) => (
  <header className="sr-hub-module__header">
    <div className="sr-hub-module__header-text">
      {icon && <div className="sr-hub-module__icon">{icon}</div>}
      <div>
        <div className="sr-hub-module__title-row">
          <h3 className="sr-hub-module__title">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="sr-hub-module__subtitle">{subtitle}</p>}
      </div>
    </div>
  </header>
);

export default ReportsWorkspaceModuleHeader;
