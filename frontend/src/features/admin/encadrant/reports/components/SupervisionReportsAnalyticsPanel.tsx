import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdminDonutChart from '../../../ui/charts/AdminDonutChart';

interface SupervisionReportsAnalyticsPanelProps {
  analytics: Record<string, unknown>;
}

const SupervisionReportsAnalyticsPanel: FunctionComponent<SupervisionReportsAnalyticsPanelProps> = ({
  analytics,
}) => {
  const { t } = useTranslation();

  const validationRate = Number(analytics.validation_rate ?? 0);
  const successRate = Number(analytics.internship_success_rate ?? 0);
  const riskDist = (analytics.risk_distribution ?? {}) as Record<string, number>;

  const riskChart = useMemo(
    () =>
      Object.entries(riskDist).map(([label, value]) => ({
        key: label,
        label,
        value,
        color:
          label === 'CRITICAL'
            ? '#ef4444'
            : label === 'HIGH'
              ? '#f97316'
              : label === 'MEDIUM'
                ? '#eab308'
                : '#3b82f6',
      })),
    [riskDist],
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="admin-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
          {t('admin.modules.reports.analytics.validationRate', { defaultValue: 'Taux de validation' })}
        </p>
        <p className="mt-1 text-2xl font-bold text-[var(--admin-text)]">
          {(validationRate * 100).toFixed(1)}%
        </p>
      </div>
      <div className="admin-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
          {t('admin.modules.reports.analytics.successRate', { defaultValue: 'Réussite stage' })}
        </p>
        <p className="mt-1 text-2xl font-bold text-[var(--admin-text)]">
          {(successRate * 100).toFixed(1)}%
        </p>
      </div>
      <div className="admin-card p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
          {t('admin.modules.reports.analytics.riskDist', { defaultValue: 'Distribution risques' })}
        </p>
        {riskChart.length > 0 ? (
          <AdminDonutChart segments={riskChart} ariaLabel={t('admin.modules.reports.analytics.riskDist', { defaultValue: 'Distribution risques' })} />
        ) : (
          <p className="text-sm text-[var(--admin-text-muted)]">—</p>
        )}
      </div>
    </div>
  );
};

export default SupervisionReportsAnalyticsPanel;
