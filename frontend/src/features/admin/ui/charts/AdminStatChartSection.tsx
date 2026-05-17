import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { fadeInUp, easePremium } from '../../dashboard/ui/animations';
import { useTranslatedStatChart } from '../../i18n/useTranslatedStatChart';
import StatPageChart from './StatPageChart';
import type { StatPageChartId } from './types';

interface AdminStatChartSectionProps {
  chartId: StatPageChartId;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

const AdminStatChartSection: FunctionComponent<AdminStatChartSectionProps> = ({
  chartId,
  title,
  subtitle,
  children,
}) => {
  const config = useTranslatedStatChart(chartId);
  if (!config) return null;
  const heading = title ?? config.title;
  const desc = subtitle ?? config.subtitle;
  return (
    <motion.section
      {...fadeInUp}
      transition={{ duration: 0.35, ease: easePremium }}
      className="admin-stat-chart-section admin-module-panel w-full min-w-0 overflow-hidden shadow-sm"
      aria-labelledby={`chart-heading-${chartId}`}
    >
      <motion.div className="flex flex-col gap-1 border-b border-[var(--admin-border)] px-4 py-3 sm:px-5 sm:py-3.5">
        <motion.div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_10%,var(--admin-bg-elevated))] text-[var(--admin-brand)] sm:h-9 sm:w-9">
            <BarChart3 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <motion.div className="min-w-0">
            <h2
              id={`chart-heading-${chartId}`}
              className="font-inter text-sm font-semibold leading-snug text-[var(--admin-text)] sm:text-base"
            >
              {heading}
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--admin-text-secondary)] sm:text-sm">{desc}</p>
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div className="px-4 py-3 sm:px-5 sm:py-4">{children ?? <StatPageChart chartId={chartId} />}</motion.div>
    </motion.section>
  );
};

export default AdminStatChartSection;
