import { FunctionComponent } from 'react';
import { CheckCircle2, Clock, LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import type { TasksInProgressSummaryStat } from '../types';

const iconMap: Record<TasksInProgressSummaryStat['icon'], LucideIcon> = {
  total: CheckCircle2,
  completed: CheckCircle2,
  pending: Clock,
};

interface TasksInProgressSummaryCardProps {
  stat: TasksInProgressSummaryStat;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const TasksInProgressSummaryCard: FunctionComponent<TasksInProgressSummaryCardProps> = ({
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

export default TasksInProgressSummaryCard;
