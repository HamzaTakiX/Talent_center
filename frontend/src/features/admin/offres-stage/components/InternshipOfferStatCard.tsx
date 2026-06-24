import { FunctionComponent } from 'react';
import {
  Archive,
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Users,
  TrendingUp,
  Award,
  LucideIcon,
} from 'lucide-react';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import { tonesFromBgClass } from '../../ui/adminKpiTones';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';

interface InternshipOfferStatCardProps {
  label: string;
  labelKey?: string;
  valueKey?: string;
  value: string;
  icon: string;
  onClick?: () => void;
  index?: number;
}

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Archive,
  Users,
  TrendingUp,
  Award,
};

const iconBgClass: Record<string, string> = {
  Briefcase: 'bg-[#2b7fff]',
  CheckCircle: 'bg-[#22c55e]',
  XCircle: 'bg-[#fb2c36]',
  FileText: 'bg-[#eab308]',
  Clock: 'bg-[#6b7280]',
  Archive: 'bg-[#6b7280]',
  Users: 'bg-[#8b5cf6]',
  TrendingUp: 'bg-[#6366f1]',
  Award: 'bg-[#06b6d4]',
};

const InternshipOfferStatCard: FunctionComponent<InternshipOfferStatCardProps> = ({
  label,
  labelKey,
  valueKey,
  value,
  icon,
  onClick,
  index = 0,
}) => {
  const translateLabel = useTranslateAdminLabel();
  const Icon = iconMap[icon] ?? Briefcase;
  const { accent, bg } = tonesFromBgClass(iconBgClass[icon] ?? '');
  const displayValue = valueKey ? translateLabel(value, valueKey) : value;

  return (
    <AdminKpiStatCard
      label={translateLabel(label, labelKey)}
      value={displayValue}
      icon={Icon}
      accent={accent}
      accentBg={bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default InternshipOfferStatCard;
