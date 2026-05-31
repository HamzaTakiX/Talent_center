import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { workspaceTasks } from '../data/workspacePlatformMock';
import type { WorkspacePlatformTask } from '../types';

const WorkspaceTasksPanel: FunctionComponent = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'list' | 'kanban' | 'timeline'>('list');

  const columns: Record<WorkspacePlatformTask['status'], WorkspacePlatformTask[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };
  workspaceTasks.forEach((task) => columns[task.status].push(task));

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 flex gap-1 rounded-lg border border-[var(--admin-border)] p-0.5 w-fit">
        {(['list', 'kanban', 'timeline'] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`rounded-md px-3 py-1 text-xs font-semibold ${view === v ? 'bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]' : 'text-[var(--admin-text-muted)]'}`}
            onClick={() => setView(v)}
          >
            {t(`student.encadrant.task.platform.views.${v}`)}
          </button>
        ))}
      </div>
      {view === 'kanban' ? (
        <div className="grid grid-cols-3 gap-2">
          {(['todo', 'in_progress', 'done'] as const).map((status) => (
            <div key={status} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-2 min-h-[8rem]">
              <p className="m-0 mb-2 text-xs font-bold uppercase text-[var(--admin-text-muted)]">
                {t(`student.encadrant.task.platform.status.${status === 'done' ? 'done' : status}`)}
              </p>
              {columns[status].map((task) => (
                <article key={task.id} className="mb-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-2 text-xs">
                  <p className="m-0 font-semibold text-[var(--admin-text)]">{t(task.titleKey)}</p>
                  <p className="m-0 mt-1 text-[var(--admin-text-muted)]">{task.dueAt}</p>
                </article>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {workspaceTasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2">
              <div>
                <p className="m-0 text-sm font-medium text-[var(--admin-text)]">{t(task.titleKey)}</p>
                {task.fromSupervisor ? (
                  <span className="text-[10px] text-[var(--admin-brand)]">{t('student.encadrant.workspace.platform.tasks.fromSupervisor')}</span>
                ) : null}
              </div>
              <span className="text-xs text-[var(--admin-text-muted)]">{task.dueAt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkspaceTasksPanel;
