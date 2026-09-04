import { FunctionComponent } from 'react';
import { AlertTriangle, CheckCircle2, Clock, FileText, LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../constants/encadrantKpiTones';
import type { ReportsSummaryStat } from '../types';

const iconMap: Record<ReportsSummaryStat['icon'], LucideIcon> = {
  submitted: FileText,
  pending: Clock,
  late: AlertTriangle,
  validated: CheckCircle2,
};

interface ReportsSummaryCardProps {
  stat: ReportsSummaryStat;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const ReportsSummaryCard: FunctionComponent<ReportsSummaryCardProps> = ({
  stat,
  onClick,
  index = 0,
}) => {
  const tones = encadrantKpiTone(stat.tone);
  return (
    <AdminKpiStatCard
      label={stat.label}
      value={String(stat.value)}
      icon={iconMap[stat.icon]}
      accent={tones.accent}
      accentBg={tones.bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default ReportsSummaryCard;
