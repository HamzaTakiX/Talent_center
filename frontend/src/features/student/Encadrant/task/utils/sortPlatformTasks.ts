import type { StudentPlatformTask, TaskPriority, TaskSortKey } from '../types';

const PRIORITY_RANK: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function sortPlatformTasks(
  tasks: StudentPlatformTask[],
  sort: TaskSortKey,
  translate: (key: string) => string = (key) => key,
): StudentPlatformTask[] {
  return [...tasks].sort((a, b) => {
    switch (sort) {
      case 'dueDesc':
        return b.daysRemaining - a.daysRemaining;
      case 'priority':
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      case 'progress':
        return b.progress - a.progress;
      case 'title':
        return translate(a.titleKey).localeCompare(translate(b.titleKey), undefined, {
          sensitivity: 'base',
        });
      case 'dueAsc':
      default:
        return a.daysRemaining - b.daysRemaining;
    }
  });
}
