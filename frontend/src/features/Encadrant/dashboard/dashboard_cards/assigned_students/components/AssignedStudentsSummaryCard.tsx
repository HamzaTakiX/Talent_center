import { FunctionComponent } from 'react';
import { LucideIcon, UserCheck, UserX, Users } from 'lucide-react';
import AdminKpiStatCard from '../../../../../admin/ui/AdminKpiStatCard';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import type { AssignedStudentsSummaryStat } from '../types';

const iconMap: Record<AssignedStudentsSummaryStat['icon'], LucideIcon> = {
  users: Users,
  active: UserCheck,
  inactive: UserX,
};

interface AssignedStudentsSummaryCardProps {
  stat: AssignedStudentsSummaryStat;
  onClick?: () => void;
  index?: number;
}

/** Thin wrapper — same KPI cell as Admin/Student. Prefer `PlatformKpiStrip` for grids. */
const AssignedStudentsSummaryCard: FunctionComponent<AssignedStudentsSummaryCardProps> = ({
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

export default AssignedStudentsSummaryCard;
