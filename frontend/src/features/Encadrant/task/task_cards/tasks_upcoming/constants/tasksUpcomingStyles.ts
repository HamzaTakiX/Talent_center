import { ENC_BADGE_WARNING, ENC_TONE_ICON } from '../../../../constants/encadrantTokens';
import type { TasksUpcomingSummaryTone } from '../types';

export const TASKS_UPCOMING_SUMMARY_STYLES: Record<
  TasksUpcomingSummaryTone,
  { iconBg: string; iconText: string }
> = {
  green: ENC_TONE_ICON.green,
  blue: ENC_TONE_ICON.blue,
  orange: ENC_TONE_ICON.orange,
};

export const TASKS_UPCOMING_PROGRESS_TRACK =
  'h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg-subtle)]';

export const TASKS_UPCOMING_PROGRESS_FILL =
  'h-full rounded-full bg-[#d97706] transition-all';

export const TASKS_UPCOMING_BADGE = ENC_BADGE_WARNING;
