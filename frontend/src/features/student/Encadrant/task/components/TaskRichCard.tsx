import { FunctionComponent } from 'react';
import { Calendar, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StudentPlatformTask } from '../types';
import { TASK_CATEGORY_CLASS } from '../constants/taskCategories';

interface TaskRichCardProps {
  task: StudentPlatformTask;
  onClick: () => void;
  dragHandle?: React.ReactNode;
  isDragging?: boolean;
  compact?: boolean;
}

const TaskRichCard: FunctionComponent<TaskRichCardProps> = ({
  task,
  onClick,
  dragHandle,
  isDragging,
  compact,
}) => {
  const { t } = useTranslation();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`student-task-card ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className={`text-[11px] font-semibold uppercase ${TASK_CATEGORY_CLASS[task.category]}`}>
            {t(`student.encadrant.task.platform.categories.${task.category}`)}
          </span>
          <span className={`admin-badge student-task-priority--${task.priority}`}>
            {t(`student.encadrant.task.platform.priorities.${task.priority}`)}
          </span>
        </div>
        {dragHandle}
      </div>
      <h3 className="m-0 text-sm font-semibold leading-snug text-[var(--admin-text)]">
        {t(task.titleKey)}
      </h3>
      {!compact ? (
        <p className="m-0 mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--admin-text-muted)]">
          {t(task.descriptionKey)}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--admin-text-muted)]">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" aria-hidden />
          {task.dueAt}
        </span>
        <span>
          {t('student.encadrant.task.platform.remaining', { days: task.daysRemaining })}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className={`admin-badge student-task-status--${task.status}`}>
          {t(`student.encadrant.task.platform.status.${task.status}`)}
        </span>
        <span className="text-xs font-semibold text-[var(--admin-brand)]">{task.progress}%</span>
      </div>
      <div className="student-agenda-progress-bar mt-2">
        <div className="student-agenda-progress-bar__fill" style={{ width: `${task.progress}%` }} />
      </div>
      {!compact ? (
        <p className="m-0 mt-2 inline-flex items-center gap-1 text-[11px] text-[var(--admin-text-muted)]">
          <User className="h-3 w-3" aria-hidden />
          {t(task.supervisorKey)}
        </p>
      ) : null}
    </article>
  );
};

export default TaskRichCard;
