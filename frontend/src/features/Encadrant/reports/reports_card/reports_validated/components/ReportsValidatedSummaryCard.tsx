import { FunctionComponent } from 'react';
import { AlertTriangle, CheckCircle2, FileText, LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import type { ReportsValidatedSummaryStat } from '../types';

const iconMap: Record<ReportsValidatedSummaryStat['icon'], LucideIcon> = {
  total: FileText,
  submitted: CheckCircle2,
  late: AlertTriangle,
};

interface ReportsValidatedSummaryCardProps {
  stat: ReportsValidatedSummaryStat;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const ReportsValidatedSummaryCard: FunctionComponent<ReportsValidatedSummaryCardProps> = ({
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

export default ReportsValidatedSummaryCard;
