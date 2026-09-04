import { FunctionComponent } from 'react';
import { Calendar, Clock, LucideIcon, XCircle } from 'lucide-react';
import AdminKpiStatCard from '../../../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import type { UpcomingMeetingsSummaryStat } from '../types';

const iconMap: Record<UpcomingMeetingsSummaryStat['icon'], LucideIcon> = {
  calendar: Calendar,
  clock: Clock,
  missed: XCircle,
};

interface UpcomingMeetingsSummaryCardProps {
  stat: UpcomingMeetingsSummaryStat;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const UpcomingMeetingsSummaryCard: FunctionComponent<UpcomingMeetingsSummaryCardProps> = ({
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

export default UpcomingMeetingsSummaryCard;
