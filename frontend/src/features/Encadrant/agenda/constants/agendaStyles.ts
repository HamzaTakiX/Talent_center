import type { AgendaMeetingStatus, AgendaMeetingType, AgendaSummaryTone } from '../types';

export const AGENDA_SUMMARY_STYLES: Record<
  AgendaSummaryTone,
  { iconWrap: string; iconText: string }
> = {
  blue: { iconWrap: 'bg-[#eff6ff]', iconText: 'text-[#2563eb]' },
  green: { iconWrap: 'bg-[#f0fdf4]', iconText: 'text-[#16a34a]' },
  purple: { iconWrap: 'bg-[#faf5ff]', iconText: 'text-[#9333ea]' },
  red: { iconWrap: 'bg-[#fef2f2]', iconText: 'text-[#dc2626]' },
};

export const AGENDA_EVENT_STYLES: Record<
  AgendaMeetingType,
  { card: string; duration: string }
> = {
  'in-person': {
    card: 'border-[#bfdbfe] bg-[#eff6ff]',
    duration: 'text-[#2563eb]',
  },
  online: {
    card: 'border-[#ddd6fe] bg-[#f5f3ff]',
    duration: 'text-[#7c3aed]',
  },
};

export const AGENDA_STATUS_BADGE: Record<AgendaMeetingStatus, string> = {
  upcoming: 'bg-[#dbeafe] text-[#1d4ed8]',
  completed: 'bg-[#dcfce7] text-[#15803d]',
  missed: 'bg-[#fee2e2] text-[#b91c1c]',
};

export const AGENDA_STATUS_LABEL: Record<AgendaMeetingStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  missed: 'Missed',
};
