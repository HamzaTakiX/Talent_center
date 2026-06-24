import { FunctionComponent, useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../shared/api/client';
import type { ApiEnvelope } from '../../api/types';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminPageHero from '../../ui/AdminPageHero';

interface OverviewMetrics {
  period_days: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  suppressed: number;
  delivery_success_rate: number;
  total_attempts: number;
}

interface EventMatrixRow {
  event_code: string;
  category: string;
  priority: string;
  channels: string[];
  resolver_label: string;
  digestible: boolean;
  urgent: boolean;
}

const NotificationAnalyticsPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [matrix, setMatrix] = useState<EventMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      apiClient.get<ApiEnvelope<OverviewMetrics>>('/admin/notifications/analytics/overview/'),
      apiClient.get<ApiEnvelope<{ items: EventMatrixRow[] }>>('/admin/notifications/matrix/'),
    ])
      .then(([overviewRes, matrixRes]) => {
        if (overviewRes.data.success && overviewRes.data.data) setMetrics(overviewRes.data.data);
        if (matrixRes.data.success && matrixRes.data.data) setMatrix(matrixRes.data.data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminModulePageShell>
      <AdminPageHero
        title={t('notifications.analytics.title')}
        subtitle={t('notifications.analytics.subtitle')}
        badge={
          <span className="inline-flex items-center gap-2 text-[var(--admin-brand)]">
            <BarChart3 className="h-4 w-4" />
          </span>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[var(--admin-text-secondary)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('notifications.center.loading')}
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ['sent', metrics?.sent],
                ['delivered', metrics?.delivered],
                ['opened', metrics?.opened],
                ['clicked', metrics?.clicked],
                ['failed', metrics?.failed],
                ['suppressed', metrics?.suppressed],
              ] as const
            ).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-[var(--admin-border)] bg-white p-4">
                <p className="m-0 text-xs uppercase tracking-wide text-[var(--admin-text-muted)]">
                  {t(`notifications.analytics.metrics.${key}`)}
                </p>
                <p className="m-0 mt-2 text-2xl font-bold text-[var(--admin-text)]">{value ?? 0}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white">
            <div className="border-b border-[var(--admin-border)] px-4 py-3">
              <h2 className="m-0 text-base font-semibold">{t('notifications.analytics.matrixTitle')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase text-[var(--admin-text-muted)]">
                  <tr>
                    <th className="px-4 py-3">{t('notifications.analytics.columns.event')}</th>
                    <th className="px-4 py-3">{t('notifications.analytics.columns.category')}</th>
                    <th className="px-4 py-3">{t('notifications.analytics.columns.priority')}</th>
                    <th className="px-4 py-3">{t('notifications.analytics.columns.channels')}</th>
                    <th className="px-4 py-3">{t('notifications.analytics.columns.recipients')}</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.event_code} className="border-t border-[var(--admin-border)]">
                      <td className="px-4 py-3 font-medium">{row.event_code}</td>
                      <td className="px-4 py-3">{row.category}</td>
                      <td className="px-4 py-3">{row.priority}</td>
                      <td className="px-4 py-3">{row.channels.join(', ')}</td>
                      <td className="px-4 py-3">{row.resolver_label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminModulePageShell>
  );
};

export default NotificationAnalyticsPage;
