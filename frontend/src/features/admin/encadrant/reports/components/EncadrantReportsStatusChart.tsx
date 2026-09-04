import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, easePremium } from '../../../dashboard/ui/animations';
import { AdminChartDonutSkeleton } from '../../../ui';
import AdminDonutChart from '../../../ui/charts/AdminDonutChart';
import type { EncadrantReportRow, EncadrantReportStatus } from '../data/encadrantReportsMock';
import type { EncadrantReportListFilter } from '../types/encadrantReportListSlice';
import {
  buildReportsStatusDonut,
  buildReportsTypeDonut,
  chartMetaForReportFilter,
} from '../utils/encadrantReportsChartData';
import { useAdminTableValues } from '../../../i18n/useAdminTableValues';

interface EncadrantReportsStatusChartProps {
  rows: EncadrantReportRow[];
  filter: EncadrantReportListFilter;
  loading?: boolean;
}

const EncadrantReportsStatusChart: FunctionComponent<EncadrantReportsStatusChartProps> = ({
  rows,
  filter,
  loading = false,
}) => {
  const { t } = useTranslation();
  const { reportStatus } = useAdminTableValues();
  const meta = useMemo(() => chartMetaForReportFilter(filter, t), [filter, t]);

  const statusLabels = useMemo(
    () =>
      ({
        Submitted: reportStatus('Submitted'),
        Pending: reportStatus('Pending'),
        Approved: reportStatus('Approved'),
        Overdue: reportStatus('Overdue'),
      }) satisfies Record<EncadrantReportStatus, string>,
    [reportStatus],
  );

  const { segments, centerTotal } = useMemo(() => {
    if (meta.mode === 'status') {
      return buildReportsStatusDonut(rows, statusLabels);
    }
    return buildReportsTypeDonut(rows);
  }, [rows, statusLabels, meta.mode]);

  const centerCaption = t('admin.charts.encadrant-reports.centerCaption', {
    defaultValue: 'rapports',
  });

  const panelClass = `admin-stat-chart-section admin-module-panel admin-section-panel w-full min-w-0 overflow-hidden shadow-sm${
    loading ? ' admin-section-panel--loading' : ''
  }`;

  if (!loading && segments.length === 0) {
    return null;
  }

  return (
    <motion.section
      {...fadeInUp}
      transition={{ duration: 0.35, ease: easePremium }}
      className={panelClass}
      aria-labelledby="encadrant-reports-chart-heading"
      aria-busy={loading}
    >
      <header className="admin-stat-chart-section__header">
        <span className="admin-stat-chart-section__icon" aria-hidden>
          <BarChart3 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="admin-stat-chart-section__copy">
          <h2 id="encadrant-reports-chart-heading" className="admin-stat-chart-section__title">
            {meta.title}
          </h2>
          <p className="admin-stat-chart-section__subtitle">{meta.subtitle}</p>
        </div>
      </header>
      <motion.div className="admin-section-panel__content px-4 py-3 sm:px-5 sm:py-4">
        {loading ? (
          <AdminChartDonutSkeleton />
        ) : (
          <AdminDonutChart
            segments={segments}
            ariaLabel={meta.ariaLabel}
            centerTotal={centerTotal}
            centerCaption={centerCaption}
          />
        )}
      </motion.div>
    </motion.section>
  );
};

export default EncadrantReportsStatusChart;
