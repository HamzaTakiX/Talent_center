import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info, Sparkles } from 'lucide-react';
import { adminHistoryApi, type HistoryInsight } from '../../api/history';

const PREFIX = 'admin.auditCenter';

const iconBySeverity = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const HistoryInsightsStrip: FunctionComponent = () => {
  const { t } = useTranslation();
  const [insights, setInsights] = useState<HistoryInsight[]>([]);

  useEffect(() => {
    let cancelled = false;
    void adminHistoryApi.insights().then((items) => {
      if (!cancelled) setInsights(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!insights.length) return null;

  return (
    <section
      className="admin-audit-insights overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]"
      data-admin-search-id="history-insights"
    >
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] px-4 py-2.5 sm:px-5">
        <Sparkles className="h-3.5 w-3.5 text-[#7c3aed]" aria-hidden />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">
          {t(`${PREFIX}.insightsTitle`)}
        </h2>
      </div>
      <ul className="divide-y divide-[var(--admin-border)]">
        {insights.map((item) => {
          const Icon = iconBySeverity[item.severity] ?? Info;
          return (
            <li key={item.code} className="flex gap-3 px-4 py-2.5 sm:px-5">
              <Icon
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                  item.severity === 'critical'
                    ? 'text-[#dc2626]'
                    : item.severity === 'warning'
                      ? 'text-[#d97706]'
                      : 'text-[#2563eb]'
                }`}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--admin-text)]">{t(item.title_key)}</p>
                <p className="text-xs text-[var(--admin-text-secondary)]">
                  {t(item.detail_key, item.metadata as Record<string, unknown>)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default HistoryInsightsStrip;
