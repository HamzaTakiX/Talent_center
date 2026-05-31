import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import type { StudentPlatformTask } from '../types';

interface TaskTimelineViewProps {
  tasks: StudentPlatformTask[];
  onSelectTask: (id: string) => void;
}

const TaskTimelineView: FunctionComponent<TaskTimelineViewProps> = ({ tasks, onSelectTask }) => {
  const { t } = useTranslation();
  const sorted = [...tasks].sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  if (sorted.length === 0) {
    return (
      <div className="p-5">
        <StudentSearchEmptyState
          titleKey="student.encadrant.task.platform.empty.tasksTitle"
          descriptionKey="student.encadrant.task.platform.empty.tasksDesc"
          variant="inline"
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5">
      {sorted.map((task, index) => (
        <button
          key={task.id}
          type="button"
          className="student-agenda-timeline-row w-full"
          onClick={() => onSelectTask(task.id)}
        >
          <div className="student-agenda-timeline-row__rail" aria-hidden>
            <span className="student-agenda-timeline-row__dot bg-[var(--admin-brand)]" />
            {index < sorted.length - 1 ? <span className="student-agenda-timeline-row__connector" /> : null}
          </div>
          <div className="student-agenda-timeline-row__card text-start">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-semibold text-[var(--admin-text)]">{t(task.titleKey)}</span>
              <span className="text-xs text-[var(--admin-text-muted)]">{task.dueAt}</span>
            </div>
            <p className="m-0 mt-1 text-xs text-[var(--admin-text-muted)]">
              {t(`student.encadrant.task.platform.status.${task.status}`)} · {task.progress}%
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TaskTimelineView;
