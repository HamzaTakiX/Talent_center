import { FunctionComponent } from 'react';
import { CalendarClock, CheckCircle2, Clock, LucideIcon } from 'lucide-react';
import { TASK_STAT_CARD } from '../constants/taskLayout';
import { TASK_SUMMARY_STYLES } from '../constants/taskStyles';
import type { TaskSummaryStat } from '../types';

const iconMap: Record<TaskSummaryStat['icon'], LucideIcon> = {
  check: CheckCircle2,
  clock: Clock,
  calendar: CalendarClock,
};

interface TaskSummaryCardProps {
  stat: TaskSummaryStat;
  onClick?: () => void;
}

const clickableCardClass = `${TASK_STAT_CARD} w-full cursor-pointer text-left transition-shadow hover:border-[rgba(0,0,0,0.12)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]`;

const TaskSummaryCard: FunctionComponent<TaskSummaryCardProps> = ({ stat, onClick }) => {
  const Icon = iconMap[stat.icon];
  const tone = TASK_SUMMARY_STYLES[stat.tone];

  const content = (
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
        <Icon className={`h-6 w-6 ${tone.iconText}`} strokeWidth={1.75} aria-hidden />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={clickableCardClass}>
        {content}
      </button>
    );
  }

  return <article className={TASK_STAT_CARD}>{content}</article>;
};

export default TaskSummaryCard;
