import { ENC_BADGE_INFO, ENC_TONE_ICON } from '../../../../constants/encadrantTokens';
import type { TasksInProgressSummaryTone } from '../types';

export const TASKS_IN_PROGRESS_SUMMARY_STYLES: Record<
  TasksInProgressSummaryTone,
  { iconBg: string; iconText: string }
> = {
  green: ENC_TONE_ICON.green,
  blue: ENC_TONE_ICON.blue,
  orange: ENC_TONE_ICON.orange,
};

export const TASKS_IN_PROGRESS_PROGRESS_TRACK =
  'h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg-subtle)]';

export const TASKS_IN_PROGRESS_PROGRESS_FILL =
  'h-full rounded-full bg-[var(--admin-brand)] transition-all';

export const TASKS_IN_PROGRESS_BADGE = ENC_BADGE_INFO;
