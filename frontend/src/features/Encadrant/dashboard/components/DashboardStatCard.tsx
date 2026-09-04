import { FunctionComponent } from 'react';
import { AlertTriangle, Calendar, FilePenLine, LucideIcon, Users } from 'lucide-react';
import AdminKpiStatCard from '../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../constants/encadrantKpiTones';
import type { DashboardStatItem } from '../types';

const statIconMap: Record<DashboardStatItem['icon'], LucideIcon> = {
  users: Users,
  alert: AlertTriangle,
  reports: FilePenLine,
  calendar: Calendar,
};

interface DashboardStatCardProps {
  stat: DashboardStatItem;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const DashboardStatCard: FunctionComponent<DashboardStatCardProps> = ({
  stat,
  onClick,
  index = 0,
}) => {
  const tones = encadrantKpiTone(stat.tone);
  return (
    <AdminKpiStatCard
      label={stat.label}
      value={String(stat.value)}
      icon={statIconMap[stat.icon]}
      accent={tones.accent}
      accentBg={tones.bg}
      onClick={onClick}
      index={index}
    />
  );
};

export default DashboardStatCard;
