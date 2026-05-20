import { FunctionComponent } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SupervisionReportDashboardSummary } from '../types/supervisionReport';

interface SupervisionReportsCriticalBannerProps {
  summary: SupervisionReportDashboardSummary;
}

const SupervisionReportsCriticalBanner: FunctionComponent<SupervisionReportsCriticalBannerProps> = ({
  summary,
}) => {
  const { t } = useTranslation();
  if (!summary.critical && !summary.overdue) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
      role="alert"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
        <span>
          {t('admin.modules.reports.banner.critical', {
            defaultValue: '{{critical}} critique(s), {{overdue}} en retard',
            critical: summary.critical,
            overdue: summary.overdue,
          })}
        </span>
      </div>
      <div className="flex gap-2">
        {summary.critical > 0 ? (
          <Link
            to="/admin/encadrant/reports/critical"
            className="admin-btn admin-btn-sm admin-btn-primary"
          >
            {t('admin.modules.reports.banner.viewCritical', { defaultValue: 'Voir critiques' })}
          </Link>
        ) : null}
        {summary.overdue > 0 ? (
          <Link
            to="/admin/encadrant/reports/overdue"
            className="admin-btn admin-btn-sm admin-btn-secondary"
          >
            {t('admin.modules.reports.banner.viewOverdue', { defaultValue: 'Voir retards' })}
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default SupervisionReportsCriticalBanner;
