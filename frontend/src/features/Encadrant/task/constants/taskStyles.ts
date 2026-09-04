import { ENC_TONE_ICON } from '../../constants/encadrantTokens';
import type { TaskSummaryTone } from '../types';

export const TASK_SUMMARY_STYLES: Record<
  TaskSummaryTone,
  { iconBg: string; iconText: string }
> = {
  green: ENC_TONE_ICON.green,
  blue: ENC_TONE_ICON.blue,
  orange: ENC_TONE_ICON.orange,
};

export const TASK_MANUAL_ICON_WRAP =
  'flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]';

export const TASK_AI_ICON_WRAP =
  'flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]';

export const TASK_PROGRESS_TRACK =
  'h-2 w-full overflow-hidden rounded-full bg-[var(--admin-bg-subtle)]';

export const TASK_PROGRESS_FILL =
  'h-full rounded-full bg-[var(--admin-brand)] transition-all';
