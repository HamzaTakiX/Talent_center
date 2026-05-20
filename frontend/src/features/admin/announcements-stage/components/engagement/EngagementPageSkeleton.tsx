import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AdminChartDonutSkeleton, AdminSectionSkeletonShell } from '../../../ui/AdminSectionSkeleton';
import { AdminKpiStripSkeleton } from '../../../ui';
import { fadeInUp } from '../../../dashboard/ui/animations';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer admin-section-shimmer ${className}`} aria-hidden />
);

const EngagementPageSkeleton: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <AdminSectionSkeletonShell label={t('admin.common.loading')}>
      <motion.div className="admin-eng-skeleton" {...fadeInUp}>
        <Shimmer className="admin-eng-skeleton__hero h-36 w-full rounded-2xl" />
        <Shimmer className="h-14 w-full rounded-xl" />
        <AdminKpiStripSkeleton count={8} />
        <div className="admin-eng-charts">
          <Shimmer className="admin-eng-skeleton__chart h-64 w-full rounded-xl" />
          <motion.div className="admin-eng-charts__row" {...fadeInUp}>
            <Shimmer className="h-52 flex-1 rounded-xl" />
            <AdminSectionSkeletonShell>
              <AdminChartDonutSkeleton legendItems={4} />
            </AdminSectionSkeletonShell>
          </motion.div>
        </div>
        <Shimmer className="h-48 w-full rounded-xl" />
      </motion.div>
    </AdminSectionSkeletonShell>
  );
};

export default EngagementPageSkeleton;
