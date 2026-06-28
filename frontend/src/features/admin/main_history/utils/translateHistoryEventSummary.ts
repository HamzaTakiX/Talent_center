import type { HistoryEventDto } from '../../api/history';

type SummaryT = (key: string, opts?: Record<string, unknown>) => string;

const SUMMARY_PREFIX = 'admin.auditCenter.summaries';

function summaryKeyFromEventCode(eventCode: string): string {
  return `${SUMMARY_PREFIX}.${eventCode.replace(/\./g, '_')}`;
}

export function translateHistoryEventSummary(
  event: Pick<HistoryEventDto, 'summary' | 'event_code'>,
  t: SummaryT,
): string {
  const fallback = event.summary?.trim() || event.event_code?.trim() || '';
  const code = event.event_code?.trim();
  if (!code) return fallback;

  const key = summaryKeyFromEventCode(code);
  const translated = t(key, { defaultValue: '' });
  return translated || fallback;
}
