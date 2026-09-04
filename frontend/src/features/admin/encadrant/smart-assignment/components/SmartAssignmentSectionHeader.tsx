import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import '../styles/admin-smart-assignment-sections.css';

interface SmartAssignmentSectionHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const SmartAssignmentSectionHeader: FunctionComponent<SmartAssignmentSectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
}) => (
  <header className="sa-section-head">
    <span className="sa-section-head__icon" aria-hidden>
      <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
    </span>
    <div className="sa-section-head__copy">
      <h2 className="sa-section-head__title">{title}</h2>
      <p className="sa-section-head__subtitle">{subtitle}</p>
    </div>
  </header>
);

export default SmartAssignmentSectionHeader;
