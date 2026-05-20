import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, easePremium } from '../../../dashboard/ui/animations';
import { AdminChartDonutSkeleton, AdminSectionEmptyState } from '../../../ui';
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

  if (loading && segments.length === 0) {
    return (
      <motion.section
        {...fadeInUp}
        transition={{ duration: 0.35, ease: easePremium }}
        className={panelClass}
        aria-busy
      >
        <motion.div className="admin-section-panel__content px-4 py-3 sm:px-5 sm:py-4">
          <AdminChartDonutSkeleton />
        </motion.div>
      </motion.section>
    );
  }

  if (segments.length === 0) {
    return (
      <motion.section
        {...fadeInUp}
        transition={{ duration: 0.35, ease: easePremium }}
        className={panelClass}
      >
        <motion.div className="admin-section-panel__content px-4 py-3 sm:px-5 sm:py-4">
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="reports"
            titleKey="admin.empty.reportsSearch"
            descriptionKey="admin.empty.tryAdjusting"
          />
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section
      {...fadeInUp}
      transition={{ duration: 0.35, ease: easePremium }}
      className={panelClass}
      aria-labelledby="encadrant-reports-chart-heading"
    >
      <div className="flex flex-col gap-1 border-b border-[var(--admin-border)] px-4 py-3 sm:px-5 sm:py-3.5">
        <motion.div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] sm:h-9 sm:w-9">
            <BarChart3 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <motion.div className="min-w-0">
            <h2
              id="encadrant-reports-chart-heading"
              className="font-inter text-sm font-semibold leading-snug text-[var(--admin-text)] sm:text-base"
            >
              {meta.title}
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--admin-text-secondary)] sm:text-sm">
              {meta.subtitle}
            </p>
          </motion.div>
        </motion.div>
      </div>
      <motion.div className="px-4 py-3 sm:px-5 sm:py-4">
        <AdminDonutChart
          segments={segments}
          ariaLabel={meta.ariaLabel}
          centerTotal={centerTotal}
          centerCaption={centerCaption}
        />
      </motion.div>
    </motion.section>
  );
};

export default EncadrantReportsStatusChart;
