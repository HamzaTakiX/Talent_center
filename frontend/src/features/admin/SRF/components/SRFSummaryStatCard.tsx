import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import { tonesFromBgClass } from '../../ui/adminKpiTones';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';

interface SRFSummaryStatCardProps {
  label: string;
  labelKey?: string;
  value: number;
  IconComponent: LucideIcon;
  iconBgClass: string;
  onClick?: () => void;
  index?: number;
}

const formatInt = (n: number) => new Intl.NumberFormat('en-US').format(n);

const SRFSummaryStatCard: FunctionComponent<SRFSummaryStatCardProps> = ({
  label,
  labelKey,
  value,
  IconComponent,
  iconBgClass,
  onClick,
  index = 0,
}) => {
  const translateLabel = useTranslateAdminLabel();
  const { accent, bg } = tonesFromBgClass(iconBgClass);
  return (
    <AdminKpiStatCard
      label={translateLabel(label, labelKey)}
      value={formatInt(value)}
      icon={IconComponent}
      accent={accent}
      accentBg={bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default SRFSummaryStatCard;
