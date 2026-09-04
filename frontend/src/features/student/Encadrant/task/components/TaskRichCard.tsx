import { FunctionComponent } from 'react';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTaskAssignee } from '../data/taskAssignees';
import type { StudentPlatformTask } from '../types';
import TaskAssigneeChip from './TaskAssigneeChip';

interface TaskRichCardProps {
  task: StudentPlatformTask;
  onClick: () => void;
  dragHandle?: React.ReactNode;
  isDragging?: boolean;
  compact?: boolean;
  lifted?: boolean;
}

const TaskRichCard: FunctionComponent<TaskRichCardProps> = ({
  task,
  onClick,
  dragHandle,
  isDragging,
  compact,
  lifted,
}) => {
  const { t } = useTranslation();
  const urgent = task.daysRemaining <= 3;
  const overdue = task.daysRemaining <= 0;
  const title = t(task.titleKey);
  const assignee = getTaskAssignee(task.assignedByKey ?? task.supervisorKey);

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
      aria-label={title}
      data-category={task.category}
      data-priority={task.priority}
      data-status={task.status}
      className={[
        'student-task-card',
        compact ? 'is-compact' : '',
        isDragging ? 'is-dragging' : '',
        lifted ? 'is-lifted' : '',
        overdue ? 'is-overdue' : urgent ? 'is-urgent' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="student-task-card-accent" aria-hidden />
      <div className="student-task-card-inner">
        <div className="student-task-card-top">
          <div className="student-task-card-tags">
            <span className="student-task-card-category">
              <span className="student-task-card-category-dot" aria-hidden />
              {t(`student.encadrant.task.platform.categories.${task.category}`)}
            </span>
            <span className={`admin-badge student-task-priority--${task.priority}`}>
              {t(`student.encadrant.task.platform.priorities.${task.priority}`)}
            </span>
          </div>
          {dragHandle}
        </div>

        <h3 className="student-task-card-title">{title}</h3>

        <TaskAssigneeChip assignee={assignee} compact={compact} showLabel={!compact} />

        {!compact ? (
          <p className="student-task-card-desc">{t(task.descriptionKey)}</p>
        ) : null}

        <div className="student-task-card-meta">
          <span className="student-task-card-due">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {task.dueAt}
          </span>
          <span className="student-task-card-remaining">
            {t('student.encadrant.task.platform.remaining', { days: task.daysRemaining })}
          </span>
        </div>

        <div className="student-task-card-foot">
          <span className={`admin-badge student-task-status--${task.status}`}>
            {t(`student.encadrant.task.platform.status.${task.status}`)}
          </span>
          <div className="student-task-card-progress">
            <div
              className="student-task-card-progress-track"
              role="progressbar"
              aria-valuenow={task.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="student-task-card-progress-fill"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="student-task-card-progress-value">{task.progress}%</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TaskRichCard;
