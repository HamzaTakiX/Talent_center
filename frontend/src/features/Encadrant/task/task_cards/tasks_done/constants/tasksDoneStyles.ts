import { ENC_BADGE_SUCCESS, ENC_TONE_ICON } from '../../../../constants/encadrantTokens';
import type { TasksDoneSummaryTone } from '../types';

export const TASKS_DONE_SUMMARY_STYLES: Record<
  TasksDoneSummaryTone,
  { iconBg: string; iconText: string }
> = {
  green: ENC_TONE_ICON.green,
  blue: ENC_TONE_ICON.blue,
  orange: ENC_TONE_ICON.orange,
};

export const TASKS_DONE_PROGRESS_TRACK =
  'h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg-subtle)]';

export const TASKS_DONE_PROGRESS_FILL =
  'h-full rounded-full bg-[#059669] transition-all';

export const TASKS_DONE_BADGE = ENC_BADGE_SUCCESS;
