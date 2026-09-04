import {
  ENC_BADGE_INFO,
  ENC_TONE_ICON,
} from '../../../../constants/encadrantTokens';
import type { MeetingType, UpcomingMeetingsSummaryTone } from '../types';

export const UPCOMING_MEETINGS_SUMMARY_STYLES: Record<
  UpcomingMeetingsSummaryTone,
  { iconBg: string; iconText: string }
> = {
  blue: ENC_TONE_ICON.blue,
  green: ENC_TONE_ICON.green,
  red: ENC_TONE_ICON.red,
};

export const UPCOMING_MEETINGS_TYPE_BADGE: Record<MeetingType, string> = {
  'in-person': ENC_BADGE_INFO,
  online: 'admin-badge admin-badge--neutral text-[var(--admin-brand)]',
};

export const UPCOMING_MEETINGS_HEADER_ICON =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]';
