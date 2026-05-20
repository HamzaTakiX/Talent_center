import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info, Sparkles } from 'lucide-react';
import type { HistoryInsight } from '../../api/history';

const PREFIX = 'admin.auditCenter';

interface HistoryInsightsStripProps {
  insights: HistoryInsight[];
}

const iconBySeverity = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const HistoryInsightsStrip: FunctionComponent<HistoryInsightsStripProps> = ({ insights }) => {
  const { t } = useTranslation();
  if (!insights.length) return null;

  return (
    <section className="admin-module-panel overflow-hidden shadow-sm" data-admin-search-id="history-insights">
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] px-4 py-3 sm:px-6">
        <Sparkles className="h-4 w-4 text-[#7c3aed]" aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--admin-text)]">{t(`${PREFIX}.insightsTitle`)}</h2>
      </div>
      <ul className="divide-y divide-[var(--admin-border)]">
        {insights.map((item) => {
          const Icon = iconBySeverity[item.severity] ?? Info;
          return (
            <li key={item.code} className="flex gap-3 px-4 py-3 sm:px-6">
              <Icon
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  item.severity === 'critical' ? 'text-[#dc2626]' : item.severity === 'warning' ? 'text-[#d97706]' : 'text-[#2563eb]'
                }`}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--admin-text)]">{t(item.title_key)}</p>
                <p className="text-xs text-[var(--admin-text-secondary)]">{t(item.detail_key, item.metadata as Record<string, unknown>)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default HistoryInsightsStrip;
