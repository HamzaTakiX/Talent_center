import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Clock3, Zap } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatRelativeTime';

interface HistoryActivitySummaryBarProps {
  total: number;
  lastActivityAt?: string;
  actionsToday?: number | null;
  loading?: boolean;
}

interface SummaryStat {
  key: string;
  label: string;
  value: string;
  icon: typeof Activity;
  accent: string;
  accentBg: string;
}

const HistoryActivitySummaryBar: FunctionComponent<HistoryActivitySummaryBarProps> = ({
  total,
  lastActivityAt,
  actionsToday,
  loading = false,
}) => {
  const { t } = useTranslation();
  const prefix = 'admin.localHistory.activitySummary';

  const lastActivity = lastActivityAt
    ? formatRelativeTime(lastActivityAt, Date.now(), (key, opts) => t(key, opts ?? {}))
    : null;

  const stats = useMemo((): SummaryStat[] => {
    const items: SummaryStat[] = [
      {
        key: 'activities',
        label: t(`${prefix}.stats.activities`),
        value: loading && total === 0 ? '—' : total.toLocaleString(),
        icon: Activity,
        accent: '#2563eb',
        accentBg: 'color-mix(in srgb, #2563eb 12%, var(--admin-bg-elevated))',
      },
      {
        key: 'lastActivity',
        label: t(`${prefix}.stats.lastActivity`),
        value: loading && !lastActivity ? '—' : lastActivity ?? t(`${prefix}.stats.none`),
        icon: Clock3,
        accent: '#0891b2',
        accentBg: 'color-mix(in srgb, #0891b2 12%, var(--admin-bg-elevated))',
      },
      {
        key: 'today',
        label: t(`${prefix}.stats.today`),
        value:
          loading && actionsToday == null ? '—' : String(actionsToday ?? 0),
        icon: Zap,
        accent: '#059669',
        accentBg: 'color-mix(in srgb, #059669 12%, var(--admin-bg-elevated))',
      },
    ];
    return items;
  }, [t, prefix, total, lastActivity, actionsToday, loading]);

  const ariaLabel = loading
    ? t(`${prefix}.loading`)
    : [
        t(`${prefix}.showing`, { count: total }),
        lastActivity ? t(`${prefix}.lastActivity`, { time: lastActivity }) : null,
        actionsToday != null ? t(`${prefix}.actionsToday`, { count: actionsToday }) : null,
      ]
        .filter(Boolean)
        .join(' · ');

  return (
    <div
      className="admin-history-activity-summary border-b border-[var(--admin-border)] px-4 py-3 sm:px-6 sm:py-3.5"
      role="status"
      aria-live="polite"
      aria-busy={loading}
      aria-label={ariaLabel}
    >
      <div className="admin-history-activity-summary__grid grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="admin-history-activity-summary__pill group flex min-w-0 items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2.5 transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--admin-border)_60%,var(--admin-brand)_40%)] hover:bg-[var(--admin-row-hover)] sm:px-3.5"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-white/10"
                style={{ background: stat.accentBg, color: stat.accent }}
                aria-hidden
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                  {stat.label}
                </span>
                <span
                  className={`truncate text-sm font-semibold tabular-nums tracking-tight text-[var(--admin-text)] sm:text-[15px] ${
                    loading ? 'animate-pulse opacity-60' : ''
                  }`}
                >
                  {stat.value}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryActivitySummaryBar;
