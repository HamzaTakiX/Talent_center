import { FunctionComponent } from 'react';
import { FileText, Clock, CheckCircle, XCircle, LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../../ui/AdminKpiStatCard';
import { useAdminCopy } from '../../../i18n/useAdminCopy';

interface DocumentStatCardProps {
  label: string;
  labelKey?: string;
  value: string;
  icon: 'FileText' | 'Clock' | 'CheckCircle' | 'XCircle';
  onClick?: () => void;
  index?: number;
}

const iconMap: Record<DocumentStatCardProps['icon'], LucideIcon> = {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
};

const toneMap: Record<DocumentStatCardProps['icon'], { accent: string; bg: string }> = {
  FileText: { accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  Clock: { accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  CheckCircle: { accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  XCircle: { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
};

const DocumentStatCard: FunctionComponent<DocumentStatCardProps> = ({
  label,
  labelKey,
  value,
  icon,
  onClick,
  index = 0,
}) => {
  const { kpiLabel } = useAdminCopy();
  const Icon = iconMap[icon];
  const { accent, bg } = toneMap[icon];
  const displayLabel = labelKey ? kpiLabel(labelKey) : label;

  return (
    <AdminKpiStatCard
      label={displayLabel}
      value={value}
      icon={Icon}
      accent={accent}
      accentBg={bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default DocumentStatCard;
