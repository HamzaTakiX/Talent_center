import type { StudentTaskItemPriority, StudentTaskItemStatus } from '../types';

export const STUDENT_TASK_STATUS_BADGE: Record<StudentTaskItemStatus, string> = {
  done: 'bg-[#dcfce7] text-[#15803d]',
  in_progress: 'bg-[#dbeafe] text-[#1d4ed8]',
  upcoming: 'bg-[#f3f4f6] text-[#525252]',
};

export const STUDENT_TASK_STATUS_LABEL: Record<StudentTaskItemStatus, string> = {
  done: 'Done',
  in_progress: 'In Progress',
  upcoming: 'Upcoming',
};

export const STUDENT_TASK_PRIORITY_BADGE: Record<StudentTaskItemPriority, string> = {
  high: 'bg-[#fee2e2] text-[#b91c1c]',
  medium: 'bg-[#ffedd5] text-[#c2410c]',
};

export const STUDENT_TASK_PRIORITY_LABEL: Record<StudentTaskItemPriority, string> = {
  high: 'High',
  medium: 'Medium',
};

export const STUDENT_TASK_ITEM_CARD_BG: Record<StudentTaskItemStatus, string> = {
  done: 'border-[#bbf7d0] bg-[#f0fdf4]',
  in_progress: 'border-[#bfdbfe] bg-[#eff6ff]',
  upcoming: 'border-[rgba(0,0,0,0.08)] bg-white',
};

export const STUDENT_TASK_ITEM_TITLE_DONE = 'line-through text-[#525252]';
