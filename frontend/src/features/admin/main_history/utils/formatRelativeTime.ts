type RelativeT = (key: string, opts?: { count?: number }) => string;

export function formatRelativeTime(
  isoOrLocal: string | undefined,
  now = Date.now(),
  t?: RelativeT,
): string {
  if (!isoOrLocal) return '';
  const parsed = Date.parse(isoOrLocal.includes('T') ? isoOrLocal : isoOrLocal.replace(' ', 'T'));
  if (Number.isNaN(parsed)) return isoOrLocal;

  const tr = (key: string, count?: number) =>
    t ? t(`admin.auditCenter.relative.${key}`, { count }) : key;

  const diffSec = Math.round((now - parsed) / 1000);
  if (diffSec < 60) return diffSec <= 1 ? tr('justNow') : tr('secondsAgo', diffSec);
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return tr('minutesAgo', diffMin);
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return tr('hoursAgo', diffHr);
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return tr('daysAgo', diffDay);
  return isoOrLocal.replace('T', ' ').slice(0, 16);
}
