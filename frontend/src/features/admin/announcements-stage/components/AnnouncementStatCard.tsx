import { FunctionComponent } from 'react';
import { Bell, Megaphone, TrendingUp, Users, LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';

interface AnnouncementStatCardProps {
  label: string;
  labelKey?: string;
  value: string;
  icon: 'Bell' | 'Megaphone' | 'TrendingUp' | 'Users';
  onClick?: () => void;
  index?: number;
}

const iconMap: Record<AnnouncementStatCardProps['icon'], LucideIcon> = {
  Bell,
  Megaphone,
  TrendingUp,
  Users,
};

const toneMap: Record<AnnouncementStatCardProps['icon'], { accent: string; bg: string }> = {
  Bell: { accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  Megaphone: { accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  TrendingUp: { accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  Users: { accent: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
};

const AnnouncementStatCard: FunctionComponent<AnnouncementStatCardProps> = ({
  label,
  labelKey,
  value,
  icon,
  onClick,
  index = 0,
}) => {
  const translateLabel = useTranslateAdminLabel();
  const Icon = iconMap[icon];
  const { accent, bg } = toneMap[icon];
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

export default AnnouncementStatCard;
