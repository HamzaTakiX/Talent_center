import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock,
  HelpCircle,
  PlayCircle,
  RefreshCw,
  Timer,
  XCircle,
} from 'lucide-react';
import type { MeetingStatus } from '../types/supervisionMeeting';

export interface MeetingStatusMeta {
  icon: LucideIcon;
  badgeClass: string;
  blockClass: string;
  dotColor: string;
}

export const meetingStatusMeta: Record<MeetingStatus, MeetingStatusMeta> = {
  SCHEDULED: {
    icon: CalendarClock,
    badgeClass: 'admin-meetings-status--scheduled',
    blockClass: 'admin-meetings-block--scheduled',
    dotColor: '#3b82f6',
  },
  CONFIRMED: {
    icon: CheckCircle2,
    badgeClass: 'admin-meetings-status--confirmed',
    blockClass: 'admin-meetings-block--confirmed',
    dotColor: '#4f46e5',
  },
  IN_PROGRESS: {
    icon: PlayCircle,
    badgeClass: 'admin-meetings-status--in-progress',
    blockClass: 'admin-meetings-block--in-progress',
    dotColor: '#d97706',
  },
  COMPLETED: {
    icon: CheckCircle2,
    badgeClass: 'admin-meetings-status--completed',
    blockClass: 'admin-meetings-block--completed',
    dotColor: '#16a34a',
  },
  DELAYED: {
    icon: Timer,
    badgeClass: 'admin-meetings-status--delayed',
    blockClass: 'admin-meetings-block--delayed',
    dotColor: '#ea580c',
  },
  RESCHEDULED: {
    icon: RefreshCw,
    badgeClass: 'admin-meetings-status--rescheduled',
    blockClass: 'admin-meetings-block--rescheduled',
    dotColor: '#7c3aed',
  },
  CANCELLED: {
    icon: XCircle,
    badgeClass: 'admin-meetings-status--cancelled',
    blockClass: 'admin-meetings-block--cancelled',
    dotColor: '#64748b',
  },
  MISSED: {
    icon: XCircle,
    badgeClass: 'admin-meetings-status--missed',
    blockClass: 'admin-meetings-block--missed',
    dotColor: '#dc2626',
  },
  NEEDS_FOLLOWUP: {
    icon: HelpCircle,
    badgeClass: 'admin-meetings-status--followup',
    blockClass: 'admin-meetings-block--followup',
    dotColor: '#e11d48',
  },
};

export const statusChartColors: Record<string, string> = {
  SCHEDULED: '#3b82f6',
  CONFIRMED: '#4f46e5',
  IN_PROGRESS: '#d97706',
  COMPLETED: '#16a34a',
  DELAYED: '#ea580c',
  RESCHEDULED: '#7c3aed',
  CANCELLED: '#64748b',
  MISSED: '#dc2626',
  NEEDS_FOLLOWUP: '#e11d48',
};

export function personInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
