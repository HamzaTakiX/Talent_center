import { FunctionComponent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { easePremium, fadeInUp } from '../dashboard/ui/animations';
import './styles/admin-section-states.css';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    className={`admin-shimmer admin-section-shimmer ${className}`}
    aria-hidden
    initial={{ opacity: 0.6 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
  />
);

interface AdminSectionSkeletonShellProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export const AdminSectionSkeletonShell: FunctionComponent<AdminSectionSkeletonShellProps> = ({
  children,
  label,
  className = '',
}) => {
  const { t } = useTranslation();
  const loadingLabel = label ?? t('admin.common.loading');

  return (
    <motion.div
      className={`admin-section-skeleton ${className}`.trim()}
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

interface AdminChartDonutSkeletonProps {
  legendItems?: number;
}

export const AdminChartDonutSkeleton: FunctionComponent<AdminChartDonutSkeletonProps> = ({
  legendItems = 4,
}) => (
  <AdminSectionSkeletonShell>
    <motion.div
      {...fadeInUp}
      className="admin-chart-donut-skeleton"
      aria-hidden
    >
      <Shimmer className="admin-chart-donut-skeleton__ring" />
      <motion.div
        className="admin-chart-donut-skeleton__legend"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06, ease: easePremium } },
        }}
      >
        {Array.from({ length: legendItems }).map((_, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, x: -4 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: easePremium } },
            }}
            className="flex items-center gap-2"
          >
            <Shimmer className="h-3 w-3 shrink-0 rounded-full" />
            <Shimmer className="h-3.5 flex-1 max-w-[8rem]" />
            <Shimmer className="h-3.5 w-8 shrink-0" />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </AdminSectionSkeletonShell>
);

interface AdminKpiStripSkeletonProps {
  count?: number;
}

export const AdminKpiStripSkeleton: FunctionComponent<AdminKpiStripSkeletonProps> = ({
  count = 4,
}) => (
  <AdminSectionSkeletonShell>
    <motion.div
      className="admin-kpi-strip-skeleton"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05, ease: easePremium } },
      }}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="admin-kpi-strip-skeleton__card"
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easePremium } },
          }}
        >
          <Shimmer className="h-10 w-10 shrink-0 rounded-lg" />
          <motion.div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-3 w-2/3 max-w-[6rem]" />
            <Shimmer className="h-6 w-1/3 max-w-[4rem]" />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  </AdminSectionSkeletonShell>
);

interface AdminPanelListSkeletonProps {
  rows?: number;
}

export const AdminPanelListSkeleton: FunctionComponent<AdminPanelListSkeletonProps> = ({
  rows = 6,
}) => (
  <AdminSectionSkeletonShell>
    <motion.ul
      className="admin-panel-list-skeleton"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05, ease: easePremium } },
      }}
      aria-hidden
    >
      {Array.from({ length: rows }).map((_, index) => (
        <motion.li
          key={index}
          className="admin-panel-list-skeleton__row space-y-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-inset)] p-3"
          variants={{
            hidden: { opacity: 0, x: -6 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: easePremium } },
          }}
        >
          <motion.div className="flex justify-between gap-2">
            <Shimmer className="h-3.5 w-32 max-w-[55%]" />
            <Shimmer className="h-3.5 w-12 shrink-0" />
          </motion.div>
          <Shimmer className="h-2 w-full rounded-full" />
        </motion.li>
      ))}
    </motion.ul>
  </AdminSectionSkeletonShell>
);
