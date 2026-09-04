import { FunctionComponent } from 'react';
import { AlertTriangle, CheckCircle2, LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import type { StudentsAtRiskSummaryStat } from '../types';

const iconMap: Record<StudentsAtRiskSummaryStat['icon'], LucideIcon> = {
  alert: AlertTriangle,
  check: CheckCircle2,
};

interface StudentsAtRiskSummaryCardProps {
  stat: StudentsAtRiskSummaryStat;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const StudentsAtRiskSummaryCard: FunctionComponent<StudentsAtRiskSummaryCardProps> = ({
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

export default StudentsAtRiskSummaryCard;
