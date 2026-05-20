import { FunctionComponent } from 'react';
import { CheckCircle2, Circle, Clock, Eye } from 'lucide-react';
import type { EncadrantTaskItem } from '../types';
import {
  taskIconWrapClass,
  taskPriorityBadgeClass,
  taskPriorityLabels,
  taskStatusBadgeClass,
  taskStatusLabels,
} from '../data/taskBadgeMaps';
import { TASK_PROGRESS_FILL, TASK_PROGRESS_TRACK } from '../constants/taskStyles';

interface TaskItemCardProps {
  task: EncadrantTaskItem;
}

const statusIcon = {
  todo: Circle,
  in_progress: Clock,
  in_review: Eye,
  done: CheckCircle2,
} as const;

const TaskItemCard: FunctionComponent<TaskItemCardProps> = ({ task }) => {
  const Icon = statusIcon[task.status];

  return (
    <article className="relative flex min-w-0 flex-col gap-3 rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-3.5 sm:flex-row sm:items-start sm:gap-4 sm:p-4">
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${taskIconWrapClass[task.status]}`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>

      <div className="min-w-0 flex-1 sm:pr-2">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <h3 className="m-0 min-w-0 flex-1 pr-2 text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">
            {task.title}
          </h3>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 font-inter text-xs font-semibold leading-4 ${taskStatusBadgeClass[task.status]}`}
            >
              {taskStatusLabels[task.status]}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 font-inter text-xs font-semibold leading-4 ${taskPriorityBadgeClass[task.priority]}`}
            >
              {taskPriorityLabels[task.priority]}
            </span>
          </div>
        </div>

        <p className="m-0 text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">{task.description}</p>

        <div className="mt-3 space-y-2">
          <p className="m-0 inline-flex items-center gap-1.5 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)]">
            <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            {task.daysRemainingLabel}
          </p>
          <div className="flex items-center gap-2">
            <div
              className={`${TASK_PROGRESS_TRACK} min-w-0 flex-1`}
              role="progressbar"
              aria-valuenow={task.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progression ${task.progress}%`}
            >
              <div className={TASK_PROGRESS_FILL} style={{ width: `${task.progress}%` }} />
            </div>
            <span className="shrink-0 font-inter text-[13px] font-semibold tabular-nums leading-5 text-[var(--admin-text)]">
              {task.progress}%
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TaskItemCard;
