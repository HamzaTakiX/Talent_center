import type { TaskPriority, TaskStatus } from '../types';

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  in_review: 'En révision',
  done: 'Terminé',
};

export const taskStatusBadgeClass: Record<TaskStatus, string> = {
  todo: 'bg-[var(--admin-surface-inset)] text-[#4b5563]',
  in_progress: 'bg-[#fef9c2] text-[#854d0e]',
  in_review: 'bg-[#eff6ff] text-[#1d4ed8]',
  done: 'bg-emerald-50 text-emerald-700',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

export const taskPriorityBadgeClass: Record<TaskPriority, string> = {
  high: 'bg-red-50 text-red-700',
  medium: 'bg-orange-50 text-orange-700',
  low: 'bg-[var(--admin-surface-inset)] text-[#4b5563]',
};

export const taskStatValueClass: Record<TaskStatus, string> = {
  todo: 'text-[var(--admin-text)]',
  in_progress: 'text-[#ea580c]',
  in_review: 'text-[#2563eb]',
  done: 'text-emerald-600',
};

export const taskIconWrapClass: Record<TaskStatus, string> = {
  todo: 'bg-[var(--admin-surface-inset)] text-[#6b7280]',
  in_progress: 'bg-[#fef9c2] text-[#ca8a04]',
  in_review: 'bg-[#eff6ff] text-[#2563eb]',
  done: 'bg-emerald-50 text-emerald-600',
};
