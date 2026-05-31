import type { TaskSummaryTone } from '../types';

export const TASK_SUMMARY_STYLES: Record<
  TaskSummaryTone,
  { iconBg: string; iconText: string }
> = {
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
  blue: { iconBg: 'bg-[#3b82f6]', iconText: 'text-white' },
  orange: { iconBg: 'bg-[#f97316]', iconText: 'text-white' },
};

export const TASK_MANUAL_ICON_WRAP = 'flex h-14 w-14 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]';

export const TASK_AI_ICON_WRAP =
  'flex h-14 w-14 items-center justify-center rounded-full bg-[#ede9fe] text-[#7c3aed]';

export const TASK_PROGRESS_TRACK = 'h-2 w-full overflow-hidden rounded-full bg-[#e5e7eb]';

export const TASK_PROGRESS_FILL = 'h-full rounded-full bg-[#3b82f6] transition-all';
