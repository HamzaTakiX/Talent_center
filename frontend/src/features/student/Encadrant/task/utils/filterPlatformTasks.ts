import type { StudentPlatformTask, TaskFilters } from '../types';

export function filterPlatformTasks(
  tasks: StudentPlatformTask[],
  filters: TaskFilters,
  search: string,
): StudentPlatformTask[] {
  const q = search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    if (filters.supervisor !== 'all' && !task.supervisorKey.endsWith(filters.supervisor)) {
      return false;
    }
    if (filters.completion === 'complete' && task.status !== 'done') return false;
    if (filters.completion === 'incomplete' && task.status === 'done') return false;
    if (filters.dueRange === 'overdue' && task.daysRemaining > 0) return false;
    if (filters.dueRange === 'week' && task.daysRemaining > 7) return false;
    if (filters.dueRange === 'month' && task.daysRemaining > 30) return false;
    if (
      q &&
      !task.titleKey.toLowerCase().includes(q) &&
      !task.descriptionKey.toLowerCase().includes(q) &&
      !task.id.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
}
