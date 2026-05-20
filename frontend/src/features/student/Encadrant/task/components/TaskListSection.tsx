import { FunctionComponent, useMemo, useState } from 'react';
import { encadrantTasks, taskTabs } from '../data/taskMock';
import type { TaskTabId } from '../types';
import { filterTasksByTab } from '../utils/filterTasksByTab';
import TaskFilterTabs from './TaskFilterTabs';
import TaskItemCard from './TaskItemCard';

const TaskListSection: FunctionComponent = () => {
  const [activeTabId, setActiveTabId] = useState<TaskTabId>('all');

  const filteredTasks = useMemo(
    () => filterTasksByTab(encadrantTasks, activeTabId),
    [activeTabId]
  );

  return (
    <section aria-label="Liste des tâches" className="flex min-w-0 flex-col gap-3 sm:gap-4">
      <TaskFilterTabs tabs={taskTabs} activeTabId={activeTabId} onTabChange={setActiveTabId} />

      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <p className="rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-8 text-center text-sm leading-5 text-[var(--admin-text-muted)]">
            Aucune tâche dans cette catégorie.
          </p>
        ) : (
          filteredTasks.map((task) => <TaskItemCard key={task.id} task={task} />)
        )}
      </div>
    </section>
  );
};

export default TaskListSection;
