import type { MeetingType, UpcomingMeetingsSummaryTone } from '../types';

export const UPCOMING_MEETINGS_SUMMARY_STYLES: Record<
  UpcomingMeetingsSummaryTone,
  { iconBg: string; iconText: string }
> = {
  blue: { iconBg: 'bg-[#3b82f6]', iconText: 'text-white' },
  green: { iconBg: 'bg-[#22c55e]', iconText: 'text-white' },
  red: { iconBg: 'bg-[#ef4444]', iconText: 'text-white' },
};

export const UPCOMING_MEETINGS_TYPE_BADGE: Record<MeetingType, string> = {
  'in-person': 'bg-[#dbeafe] text-[#1d4ed8]',
  online: 'bg-[#ede9fe] text-[#6d28d9]',
};

export const UPCOMING_MEETINGS_HEADER_ICON =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb]';
