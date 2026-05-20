import { FunctionComponent, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import DashboardSectionHeader from '../../../admin/dashboard/components/DashboardSectionHeader';
import { STUDENT_SECTION_LINK } from '../constants/studentDashboardStyles';

interface StudentSectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/** En-tête de section aligné sur le design system admin (barre brand, icône, titre). */
const StudentSectionHeader: FunctionComponent<StudentSectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => {
  const actionNode =
    action != null ? (
      <button type="button" onClick={action.onClick} className={STUDENT_SECTION_LINK}>
        {action.label}
        <ChevronRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={2}
          aria-hidden
        />
      </button>
    ) : undefined;

  return (
    <DashboardSectionHeader
      icon={icon}
      title={title}
      subtitle={subtitle}
      action={actionNode}
    />
  );
};

export default StudentSectionHeader;
