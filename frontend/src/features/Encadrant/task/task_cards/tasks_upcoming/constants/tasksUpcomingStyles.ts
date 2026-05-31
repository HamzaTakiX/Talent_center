import type { TasksUpcomingSummaryTone } from '../types';

export const TASKS_UPCOMING_SUMMARY_STYLES: Record<
  TasksUpcomingSummaryTone,
  { iconBg: string; iconText: string }
> = {
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
  blue: { iconBg: 'bg-[#3b82f6]', iconText: 'text-white' },
  orange: { iconBg: 'bg-[#f97316]', iconText: 'text-white' },
};

export const TASKS_UPCOMING_PROGRESS_TRACK = 'h-2 w-full overflow-hidden rounded-full bg-[#e5e7eb]';

export const TASKS_UPCOMING_PROGRESS_FILL = 'h-full rounded-full bg-[#f97316] transition-all';

export const TASKS_UPCOMING_BADGE =
  'inline-flex w-fit items-center rounded-full bg-[#ffedd5] px-2.5 py-0.5 text-xs font-medium leading-4 text-[#c2410c]';
