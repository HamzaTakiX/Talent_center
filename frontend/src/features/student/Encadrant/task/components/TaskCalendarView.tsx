import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import type { StudentPlatformTask } from '../types';

interface TaskCalendarViewProps {
  tasks: StudentPlatformTask[];
  onSelectTask: (id: string) => void;
}

const TaskCalendarView: FunctionComponent<TaskCalendarViewProps> = ({ tasks, onSelectTask }) => {
  const { t } = useTranslation();

  const byDate = useMemo(() => {
    const map = new Map<string, StudentPlatformTask[]>();
    tasks.forEach((task) => {
      const list = map.get(task.dueAt) ?? [];
      list.push(task);
      map.set(task.dueAt, list);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  if (byDate.length === 0) {
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
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
      {byDate.map(([date, dayTasks]) => (
        <div
          key={date}
          className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3"
        >
          <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide text-[var(--admin-brand)]">
            {date}
          </p>
          {dayTasks.map((task) => (
            <button
              key={task.id}
              type="button"
              className="mb-1.5 block w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2 py-1.5 text-start text-xs font-medium text-[var(--admin-text)] transition-colors hover:border-[var(--admin-brand)]"
              onClick={() => onSelectTask(task.id)}
            >
              {t(task.titleKey)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TaskCalendarView;
