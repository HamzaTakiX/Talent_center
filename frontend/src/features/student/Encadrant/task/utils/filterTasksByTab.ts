import type { EncadrantTaskItem, TaskTabId } from '../types';

export function filterTasksByTab(tasks: EncadrantTaskItem[], tabId: TaskTabId): EncadrantTaskItem[] {
  if (tabId === 'all') return tasks;
  return tasks.filter((task) => task.status === tabId);
}
