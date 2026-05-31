import { FunctionComponent } from 'react';
import { CheckCircle2, Clock, LucideIcon } from 'lucide-react';
import { TASKS_IN_PROGRESS_STAT_CARD } from '../constants/tasksInProgressLayout';
import { TASKS_IN_PROGRESS_SUMMARY_STYLES } from '../constants/tasksInProgressStyles';
import type { TasksInProgressSummaryStat } from '../types';

const iconMap: Record<TasksInProgressSummaryStat['icon'], LucideIcon> = {
  total: CheckCircle2,
  completed: CheckCircle2,
  pending: Clock,
};

interface TasksInProgressSummaryCardProps {
  stat: TasksInProgressSummaryStat;
}

const TasksInProgressSummaryCard: FunctionComponent<TasksInProgressSummaryCardProps> = ({ stat }) => {
  const Icon = iconMap[stat.icon];
  const tone = TASKS_IN_PROGRESS_SUMMARY_STYLES[stat.tone];

  return (
    <article className={TASKS_IN_PROGRESS_STAT_CARD}>
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
    </article>
  );
};

export default TasksInProgressSummaryCard;
