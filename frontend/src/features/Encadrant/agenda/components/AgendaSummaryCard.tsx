import { FunctionComponent } from 'react';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Clock,
  LucideIcon,
} from 'lucide-react';
import AdminKpiStatCard from '../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../constants/encadrantKpiTones';
import type { AgendaSummaryStat } from '../types';

const iconMap: Record<AgendaSummaryStat['icon'], LucideIcon> = {
  calendar: Calendar,
  clock: Clock,
  calendarUpcoming: CalendarDays,
  alert: AlertCircle,
};

interface AgendaSummaryCardProps {
  stat: AgendaSummaryStat;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const AgendaSummaryCard: FunctionComponent<AgendaSummaryCardProps> = ({
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

export default AgendaSummaryCard;
