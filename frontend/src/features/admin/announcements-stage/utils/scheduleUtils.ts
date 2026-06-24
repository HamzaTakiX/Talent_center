export type PublicationMode = 'immediate' | 'schedule';

export const SCHEDULE_TIMEZONE_OPTIONS = [
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca (GMT+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'UTC', label: 'UTC' },
] as const;

export const DEFAULT_SCHEDULE_TIMEZONE = 'Africa/Casablanca';

export interface PublicationScheduleValues {
  publicationMode: PublicationMode;
  publishDate: string;
  publishTime: string;
  timezone: string;
}

export function createDefaultPublicationSchedule(): PublicationScheduleValues {
  return {
    publicationMode: 'immediate',
    publishDate: '',
    publishTime: '08:00',
    timezone: DEFAULT_SCHEDULE_TIMEZONE,
  };
}

export function formatScheduledPreview(
  publishDate: string,
  publishTime: string,
  locale = 'fr-FR',
): string | null {
  if (!publishDate || !publishTime) return null;
  const [year, month, day] = publishDate.split('-').map(Number);
  const [hours, minutes] = publishTime.split(':').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, hours || 0, minutes || 0);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function splitPublishStartAt(iso: string | null | undefined): {
  publishDate: string;
  publishTime: string;
} {
  if (!iso) return { publishDate: '', publishTime: '08:00' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { publishDate: '', publishTime: '08:00' };
  const publishDate = d.toISOString().slice(0, 10);
  const publishTime = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  return { publishDate, publishTime };
}

export function isFutureSchedule(publishDate: string, publishTime: string, timezone: string): boolean {
  if (!publishDate || !publishTime) return false;
  const localIso = `${publishDate}T${publishTime}:00`;
  const probe = new Date(localIso);
  if (Number.isNaN(probe.getTime())) return false;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const nowParts = formatter.formatToParts(new Date());
  const pick = (type: string) => nowParts.find((p) => p.type === type)?.value ?? '';
  const nowLocal = `${pick('year')}-${pick('month')}-${pick('day')}T${pick('hour')}:${pick('minute')}:00`;
  const targetLocal = `${publishDate}T${publishTime}:00`;
  return targetLocal > nowLocal;
}

export function formatListDate(iso: string | null | undefined, locale = 'fr-FR'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

export function formatListTime(iso: string | null | undefined, timezone?: string, locale = 'fr-FR'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone || undefined,
  }).format(d);
}
