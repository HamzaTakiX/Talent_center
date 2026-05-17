import { FunctionComponent, MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import { tonesFromBgClass } from '../../ui/adminKpiTones';

interface StudentDashboardStatCardProps {
  label: string;
  labelKey?: string;
  value: number;
  IconComponent: LucideIcon;
  iconBgClass: string;
  valueSuffix?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  index?: number;
}

const formatInt = (n: number) => new Intl.NumberFormat('en-US').format(n);

const StudentDashboardStatCard: FunctionComponent<StudentDashboardStatCardProps> = ({
  label,
  labelKey,
  value,
  IconComponent,
  iconBgClass,
  valueSuffix,
  onClick,
  index = 0,
}) => {
  const { kpiLabel } = useAdminCopy();
  const { accent, bg } = tonesFromBgClass(iconBgClass);
  const displayValue = valueSuffix ? `${formatInt(value)}${valueSuffix}` : formatInt(value);
  const displayLabel = labelKey ? kpiLabel(labelKey) : label;

  return (
    <AdminKpiStatCard
      label={displayLabel}
      value={displayValue}
      icon={IconComponent}
      accent={accent}
      accentBg={bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default StudentDashboardStatCard;
