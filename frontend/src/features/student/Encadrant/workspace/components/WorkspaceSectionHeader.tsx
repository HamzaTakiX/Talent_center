import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface WorkspaceSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

const WorkspaceSectionHeader: FunctionComponent<WorkspaceSectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
}) => (
  <header
    className={`student-workspace-section-head${actions ? ' student-workspace-section-head--with-actions' : ''}${className ? ` ${className}` : ''}`}
  >
    <div className="student-workspace-section-head__intro">
      <span className="student-workspace-section-head__icon" aria-hidden>
        <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>
      <div className="student-workspace-section-head__copy">
        <h2 className="student-workspace-section-head__title">{title}</h2>
        {subtitle ? (
          <p className="student-workspace-section-head__subtitle">{subtitle}</p>
        ) : null}
      </div>
    </div>
    {actions ? <div className="student-workspace-section-head__actions">{actions}</div> : null}
  </header>
);

export default WorkspaceSectionHeader;
