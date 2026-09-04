import type { MeetingStatus } from '../../../admin/encadrant/meetings/types/supervisionMeeting';

const localeMap: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-MA',
};

const BACKEND_STATUSES = new Set<string>([
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'DELAYED',
  'RESCHEDULED',
  'CANCELLED',
  'MISSED',
  'NEEDS_FOLLOWUP',
]);

const MOCK_STATUS_MAP: Record<string, MeetingStatus> = {
  upcoming: 'SCHEDULED',
  scheduled: 'SCHEDULED',
  confirmed: 'CONFIRMED',
  in_progress: 'IN_PROGRESS',
  past: 'COMPLETED',
  completed: 'COMPLETED',
  done: 'COMPLETED',
  missed: 'MISSED',
  cancelled: 'CANCELLED',
  delayed: 'DELAYED',
  rescheduled: 'RESCHEDULED',
};

export function getMeetingLocale(language: string): string {
  const base = language.split('-')[0] ?? 'fr';
  return localeMap[base] ?? localeMap.fr;
}

export function normalizeMeetingStatus(status?: string | null): MeetingStatus | undefined {
  if (!status) return undefined;
  const upper = status.toUpperCase();
  if (BACKEND_STATUSES.has(upper)) return upper as MeetingStatus;
  return MOCK_STATUS_MAP[status.toLowerCase()];
}

export function formatMeetingDate(
  iso: string,
  language: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(getMeetingLocale(language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...options,
  });
}

export function formatMeetingTime(iso: string, language: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(getMeetingLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMeetingDateTime(iso: string, language: string): string {
  const dateLabel = formatMeetingDate(iso, language);
  const timeLabel = formatMeetingTime(iso, language);
  if (!dateLabel && !timeLabel) return '';
  if (!timeLabel) return dateLabel;
  if (!dateLabel) return timeLabel;
  return `${dateLabel} · ${timeLabel}`;
}

export function parseMockDateTime(date: string, time: string): string | undefined {
  const match = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return undefined;
  const [, hours, minutes] = timeMatch;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes}:00`;
}
