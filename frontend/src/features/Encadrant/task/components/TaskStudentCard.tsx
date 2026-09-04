import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getEncadrantStudentTaskDetailPath } from '../constants/routes';
import { TASK_STUDENT_CARD } from '../constants/taskLayout';
import { TASK_PROGRESS_FILL, TASK_PROGRESS_TRACK } from '../constants/taskStyles';
import type { StudentTaskOverview } from '../types';

interface TaskStudentCardProps {
  student: StudentTaskOverview;
}

const TaskStudentCard: FunctionComponent<TaskStudentCardProps> = ({ student }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <article
      className={`${TASK_STUDENT_CARD} cursor-pointer transition-colors hover:border-[var(--admin-border)] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]`}
      role="button"
      tabIndex={0}
      onClick={() => navigate(getEncadrantStudentTaskDetailPath(student.id))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(getEncadrantStudentTaskDetailPath(student.id));
        }
      }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)]">{student.name}</h3>
          <p className="m-0 mt-0.5 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">{student.level}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--admin-text-secondary)]">
          <User className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" strokeWidth={1.75} aria-hidden />
          <span className="tabular-nums whitespace-nowrap">
            {t('encadrant.task.taskCount', { count: student.totalTasks })}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <p className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">
          {t('encadrant.task.nextTask')}:
        </p>
        <p className="m-0 mt-1 text-sm font-medium leading-5 text-[var(--admin-text)]">{student.nextTaskTitle}</p>
        <p className="m-0 mt-1 text-xs font-normal leading-4 text-[var(--admin-text-secondary)]">
          {t('encadrant.task.due')}: {student.nextTaskDue}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium leading-5 text-[var(--admin-text)]">
            {t('encadrant.common.progress')}
          </span>
          <span className="text-sm font-medium tabular-nums leading-5 text-[var(--admin-text-secondary)]">
            {student.completedTasks}/{student.totalTasks} ({student.progressPercent}%)
          </span>
        </div>
        <div
          className={TASK_PROGRESS_TRACK}
          role="progressbar"
          aria-valuenow={student.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={TASK_PROGRESS_FILL} style={{ width: `${student.progressPercent}%` }} />
        </div>
      </div>
    </article>
  );
};

export default TaskStudentCard;
