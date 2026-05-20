import { FunctionComponent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../dashboard/ui/animations';
import '../styles/admin-smart-assignment-sections.css';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer sa-section-shimmer ${className}`} aria-hidden />
);

interface SkeletonShellProps {
  children: ReactNode;
  label?: string;
}

const SkeletonShell: FunctionComponent<SkeletonShellProps> = ({ children, label }) => {
  const { t } = useTranslation();
  const loadingLabel = label ?? t('admin.smartAssignment.loading');

  return (
    <motion.div
      className="sa-section-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={loadingLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: easePremium }}
    >
      <span className="sr-only">{loadingLabel}</span>
      {children}
    </motion.div>
  );
};

interface SmartAssignmentEncadrantsGridSkeletonProps {
  count?: number;
}

export const SmartAssignmentEncadrantsGridSkeleton: FunctionComponent<
  SmartAssignmentEncadrantsGridSkeletonProps
> = ({ count = 6 }) => {
  const { t } = useTranslation();

  return (
    <SkeletonShell label={t('admin.smartAssignment.loading')}>
      <motion.div
        className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06, ease: easePremium } },
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <motion.article
            key={index}
            className="sa-encadrant-card-skeleton"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easePremium } },
            }}
            aria-hidden
          >
            <div className="sa-encadrant-card-skeleton__header">
              <Shimmer className="h-11 w-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Shimmer className="h-4 w-3/5 max-w-[10rem]" />
                <Shimmer className="h-3 w-4/5 max-w-[12rem]" />
              </div>
              <Shimmer className="h-6 w-14 shrink-0 rounded-full" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Shimmer className="h-5 w-16 rounded-full" />
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="h-5 w-14 rounded-full" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between gap-2">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-3 w-8" />
              </div>
              <Shimmer className="h-2 w-full rounded-full" />
            </div>
            <Shimmer className="mt-3 h-9 w-full rounded-lg" />
          </motion.article>
        ))}
      </motion.div>
    </SkeletonShell>
  );
};

interface SmartAssignmentWorkloadSkeletonProps {
  rows?: number;
}

export const SmartAssignmentWorkloadSkeleton: FunctionComponent<
  SmartAssignmentWorkloadSkeletonProps
> = ({ rows = 8 }) => {
  const { t } = useTranslation();

  return (
    <SkeletonShell label={t('admin.smartAssignment.loading')}>
      <motion.ul
        className="sa-workload-skeleton"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05, ease: easePremium } },
        }}
      >
        {Array.from({ length: rows }).map((_, index) => (
          <motion.li
            key={index}
            className="sa-workload-skeleton__row"
            variants={{
              hidden: { opacity: 0, x: -6 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: easePremium } },
            }}
            aria-hidden
          >
            <div className="sa-workload-skeleton__head">
              <Shimmer className="h-3.5 w-32 max-w-[55%]" />
              <Shimmer className="h-3.5 w-12 shrink-0" />
            </div>
            <Shimmer className="sa-workload-skeleton__bar" />
          </motion.li>
        ))}
      </motion.ul>
    </SkeletonShell>
  );
};
