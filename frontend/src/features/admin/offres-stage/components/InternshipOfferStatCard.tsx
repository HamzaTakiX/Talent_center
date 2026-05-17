import { FunctionComponent } from 'react';
import {
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
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';

interface InternshipOfferStatCardProps {
  label: string;
  labelKey?: string;
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
  Users,
  TrendingUp,
  Award,
};

const toneMap: Record<string, { accent: string; bg: string }> = {
  Briefcase: { accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  CheckCircle: { accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  XCircle: { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  FileText: { accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  Clock: { accent: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
  Users: { accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  TrendingUp: { accent: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
  Award: { accent: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
};

const InternshipOfferStatCard: FunctionComponent<InternshipOfferStatCardProps> = ({
  label,
  labelKey,
  value,
  icon,
  onClick,
  index = 0,
}) => {
  const translateLabel = useTranslateAdminLabel();
  const Icon = iconMap[icon] ?? Briefcase;
  const { accent, bg } = toneMap[icon] ?? toneMap.Briefcase;

  return (
    <AdminKpiStatCard
      label={translateLabel(label, labelKey)}
      value={value}
      icon={Icon}
      accent={accent}
      accentBg={bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default InternshipOfferStatCard;
