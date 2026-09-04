import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { fadeInUp, easePremium } from '../../dashboard/ui/animations';
import { useTranslatedStatChart } from '../../i18n/useTranslatedStatChart';
import { AdminChartDonutSkeleton } from '../AdminSectionSkeleton';
import StatPageChart from './StatPageChart';
import type { StatPageChartId } from './types';

interface AdminStatChartSectionProps {
  chartId: StatPageChartId;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  loading?: boolean;
}

const AdminStatChartSection: FunctionComponent<AdminStatChartSectionProps> = ({
  chartId,
  title,
  subtitle,
  children,
  loading = false,
}) => {
  const config = useTranslatedStatChart(chartId);
  if (!config) return null;
  const heading = title ?? config.title;
  const desc = subtitle ?? config.subtitle;
  const panelClass = `admin-stat-chart-section admin-module-panel admin-section-panel w-full min-w-0 overflow-hidden shadow-sm${
    loading ? ' admin-section-panel--loading' : ''
  }`;
  return (
    <motion.section
      {...fadeInUp}
      transition={{ duration: 0.35, ease: easePremium }}
      className={panelClass}
      aria-labelledby={`chart-heading-${chartId}`}
      aria-busy={loading}
    >
      <header className="admin-stat-chart-section__header">
        <span className="admin-stat-chart-section__icon" aria-hidden>
          <BarChart3 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="admin-stat-chart-section__copy">
          <h2 id={`chart-heading-${chartId}`} className="admin-stat-chart-section__title">
            {heading}
          </h2>
          {desc ? <p className="admin-stat-chart-section__subtitle">{desc}</p> : null}
        </div>
      </header>
      <motion.div className="admin-section-panel__content px-4 py-3 sm:px-5 sm:py-4">
        {loading ? <AdminChartDonutSkeleton /> : children ?? <StatPageChart chartId={chartId} />}
      </motion.div>
    </motion.section>
  );
};

export default AdminStatChartSection;
