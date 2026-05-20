import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Bot, ShieldAlert, Users } from 'lucide-react';
import type { HistoryCenterPayload } from '../../api/history';

const PREFIX = 'admin.auditCenter';

interface HistoryAnalyticsPanelProps {
  summary: HistoryCenterPayload['dashboard']['summary'] | null;
  activityTrend: { date: string; count: number }[];
  byModule: { source_app: string; count: number }[];
  loading?: boolean;
}

const HistoryAnalyticsPanel: FunctionComponent<HistoryAnalyticsPanelProps> = ({
  summary,
  activityTrend,
  byModule,
  loading = false,
}) => {
  const { t } = useTranslation();
  const maxTrend = useMemo(() => Math.max(1, ...activityTrend.map((d) => d.count)), [activityTrend]);
  const maxModule = useMemo(() => Math.max(1, ...byModule.map((d) => d.count)), [byModule]);

  const kpis = [
    { key: 'total', icon: Activity, value: summary?.total_events ?? '—', label: t(`${PREFIX}.kpis.totalEvents`), tone: 'text-[#2563eb] bg-[#eaf1ff]' },
    { key: 'critical', icon: ShieldAlert, value: summary?.critical_last_24h ?? '—', label: t(`${PREFIX}.kpis.critical24h`), tone: 'text-[#dc2626] bg-[#fee2e2]' },
    { key: 'automated', icon: Bot, value: summary?.automated_last_7d ?? '—', label: t(`${PREFIX}.kpis.automated7d`), tone: 'text-[#7c3aed] bg-[#f3e8ff]' },
    { key: 'actors', icon: Users, value: summary?.active_actors_7d ?? '—', label: t(`${PREFIX}.kpis.activeActors`), tone: 'text-[#059669] bg-[#e7f6ec]' },
  ];

  return (
    <section className="admin-module-panel w-full min-w-0 overflow-hidden shadow-sm" aria-busy={loading} data-admin-search-id="history-analytics">
      <div className="border-b border-[var(--admin-border)] px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--admin-text)]">{t(`${PREFIX}.analyticsTitle`)}</h2>
        <p className="mt-0.5 text-sm text-[var(--admin-text-secondary)]">{t(`${PREFIX}.analyticsSubtitle`)}</p>
      </div>
      {loading ? (
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="admin-skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-5 p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map(({ key, icon: Icon, value, label, tone }) => (
              <div key={key} className="admin-mobile-card flex items-center gap-3 rounded-xl p-4 transition hover:shadow-md">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xl font-semibold tabular-nums text-[var(--admin-text)]">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </p>
                  <p className="text-xs text-[var(--admin-text-secondary)]">{label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="admin-mobile-card rounded-xl p-4">
              <h3 className="text-sm font-medium text-[var(--admin-text)]">{t(`${PREFIX}.charts.activityTrend`)}</h3>
              <div className="mt-4 flex h-28 items-end gap-1">
                {activityTrend.length === 0 ? (
                  <p className="text-xs text-[var(--admin-text-secondary)]">{t(`${PREFIX}.charts.empty`)}</p>
                ) : (
                  activityTrend.map((d) => (
                    <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                      <div className="w-full max-w-[2rem] rounded-t bg-[#2563eb]/80" style={{ height: `${Math.max(8, (d.count / maxTrend) * 100)}%` }} title={`${d.count}`} />
                      <span className="truncate text-[0.625rem] text-[var(--admin-text-secondary)]">{d.date.slice(5)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="admin-mobile-card rounded-xl p-4">
              <h3 className="text-sm font-medium text-[var(--admin-text)]">{t(`${PREFIX}.charts.moduleDistribution`)}</h3>
              <ul className="mt-3 space-y-2">
                {byModule.length === 0 ? (
                  <li className="text-xs text-[var(--admin-text-secondary)]">{t(`${PREFIX}.charts.empty`)}</li>
                ) : (
                  byModule.slice(0, 6).map((m) => (
                    <li key={m.source_app} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[var(--admin-text)]">{t(`${PREFIX}.modules.${m.source_app}`, m.source_app)}</span>
                        <span className="tabular-nums text-[var(--admin-text-secondary)]">{m.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--admin-border)]">
                        <div className="h-full rounded-full bg-[#4f46e5]" style={{ width: `${(m.count / maxModule) * 100}%` }} />
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HistoryAnalyticsPanel;
