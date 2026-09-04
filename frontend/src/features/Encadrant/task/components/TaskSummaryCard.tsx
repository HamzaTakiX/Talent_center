import { FunctionComponent } from 'react';
import { CalendarClock, CheckCircle2, Clock, LucideIcon } from 'lucide-react';
import AdminKpiStatCard from '../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../constants/encadrantKpiTones';
import type { TaskSummaryStat } from '../types';

const iconMap: Record<TaskSummaryStat['icon'], LucideIcon> = {
  check: CheckCircle2,
  clock: Clock,
  calendar: CalendarClock,
};

interface TaskSummaryCardProps {
  stat: TaskSummaryStat;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const TaskSummaryCard: FunctionComponent<TaskSummaryCardProps> = ({
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

export default TaskSummaryCard;
