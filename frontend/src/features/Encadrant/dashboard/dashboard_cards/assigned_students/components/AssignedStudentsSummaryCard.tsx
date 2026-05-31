import { FunctionComponent } from 'react';
import { LucideIcon, UserCheck, UserX, Users } from 'lucide-react';
import { ASSIGNED_STUDENTS_STAT_CARD } from '../constants/assignedStudentsLayout';
import { ASSIGNED_STUDENTS_SUMMARY_STYLES } from '../constants/assignedStudentsStyles';
import type { AssignedStudentsSummaryStat } from '../types';

const iconMap: Record<AssignedStudentsSummaryStat['icon'], LucideIcon> = {
  users: Users,
  active: UserCheck,
  inactive: UserX,
};

interface AssignedStudentsSummaryCardProps {
  stat: AssignedStudentsSummaryStat;
}

const AssignedStudentsSummaryCard: FunctionComponent<AssignedStudentsSummaryCardProps> = ({
  stat,
}) => {
  const Icon = iconMap[stat.icon];
  const tone = ASSIGNED_STUDENTS_SUMMARY_STYLES[stat.tone];

  return (
    <article className={ASSIGNED_STUDENTS_STAT_CARD}>
      <div className="flex min-h-0 flex-1 items-center justify-between gap-4 p-5 sm:gap-5 sm:p-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-medium leading-5 text-[#717182]">{stat.label}</span>
          <span className="text-3xl font-bold leading-9 tracking-tight text-[#0a0a0a] tabular-nums">
            {stat.value}
          </span>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] ${tone.iconBg}`}
        >
          <Icon className={`h-6 w-6 ${tone.iconText}`} strokeWidth={1.75} />
        </div>
      </div>
    </article>
  );
};

export default AssignedStudentsSummaryCard;

