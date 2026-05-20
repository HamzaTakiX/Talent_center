import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../dashboard/ui/animations';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    className={`admin-shimmer rounded-lg ${className}`}
    aria-hidden
    animate={{ opacity: [0.45, 0.85, 0.45] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const AnalyticsCardSkeleton: FunctionComponent = () => (
  <div className="sa-type-analytics-card sa-analytics-skeleton-card" aria-hidden>
    <motion.header
      className="sa-type-analytics-card__header"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Shimmer className="h-10 w-10 shrink-0 rounded-xl" />
      <motion.div className="min-w-0 flex-1 space-y-2">
        <Shimmer className="h-4 w-40 max-w-full" />
        <Shimmer className="h-3 w-56 max-w-full" />
      </motion.div>
      <Shimmer className="h-14 w-[4.5rem] shrink-0 rounded-lg" />
    </motion.header>
    <motion.div className="sa-type-analytics-card__kpis">
      <Shimmer className="h-14 w-full rounded-lg" />
      <Shimmer className="h-14 w-full rounded-lg" />
      <Shimmer className="h-14 w-full rounded-lg" />
    </motion.div>
    <div className="sa-type-analytics-card__body">
      <div className="sa-type-analytics-visual sa-analytics-skeleton-visual">
        <Shimmer className="h-[124px] w-[124px] rounded-full" />
        <div className="w-full space-y-2">
          <Shimmer className="h-2 w-full" />
          <Shimmer className="h-2 w-4/5" />
          <Shimmer className="h-2 w-3/5" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between gap-2">
              <Shimmer className="h-3 w-2/5" />
              <Shimmer className="h-3 w-12" />
            </div>
            <Shimmer className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
    <Shimmer className="h-16 w-full rounded-lg" />
  </div>
);

const SmartAssignmentInternshipAnalyticsSkeleton: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
  <section
    className="admin-smart-assignment-analytics admin-smart-assignment-analytics--loading"
    aria-busy="true"
    aria-live="polite"
    aria-label={t('admin.smartAssignment.analytics.loadingAnalytics')}
  >
    <p className="sr-only">{t('admin.smartAssignment.analytics.loadingAnalytics')}</p>
    <header className="admin-smart-assignment-analytics__header">
      <Shimmer className="h-5 w-48 max-w-full" />
      <Shimmer className="mt-2 h-3.5 w-72 max-w-full" />
    </header>
    <div className="admin-smart-assignment-analytics__alerts">
      {Array.from({ length: 4 }).map((_, i) => (
        <Shimmer key={i} className="h-[4.25rem] w-full rounded-xl" />
      ))}
    </div>
    <div className="admin-smart-assignment-analytics__grid">
      <AnalyticsCardSkeleton />
      <AnalyticsCardSkeleton />
    </div>
  </section>
  );
};

export default SmartAssignmentInternshipAnalyticsSkeleton;
