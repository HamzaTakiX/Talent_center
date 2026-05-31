import type { TaskCategory } from '../types';

export const TASK_CATEGORY_CLASS: Record<TaskCategory, string> = {
  internship: 'student-task-cat--internship',
  reports: 'student-task-cat--reports',
  meetings: 'student-task-cat--meetings',
  documents: 'student-task-cat--documents',
  administrative: 'student-task-cat--admin',
  srf: 'student-task-cat--srf',
  personal: 'student-task-cat--personal',
};

export const KANBAN_COLUMNS = ['todo', 'in_progress', 'in_review', 'done'] as const;
