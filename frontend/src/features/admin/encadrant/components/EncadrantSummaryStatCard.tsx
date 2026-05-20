import { FunctionComponent, MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import { tonesFromBgClass } from '../../ui/adminKpiTones';

interface EncadrantSummaryStatCardProps {
  label: string;
  value: number | string;
  IconComponent: LucideIcon;
  iconBgClass: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  index?: number;
}

const formatValue = (n: number | string) =>
  typeof n === 'string' ? n : new Intl.NumberFormat('en-US').format(n);

const EncadrantSummaryStatCard: FunctionComponent<EncadrantSummaryStatCardProps> = ({
  label,
  value,
  IconComponent,
  iconBgClass,
  onClick,
  index = 0,
}) => {
  const { accent, bg } = tonesFromBgClass(iconBgClass);
  return (
    <AdminKpiStatCard
      label={label}
      value={formatValue(value)}
      icon={IconComponent}
      accent={accent}
      accentBg={bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default EncadrantSummaryStatCard;
