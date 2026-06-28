import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import DashboardStatCard from './DashboardStatCard';
import { DashboardStatsSkeleton } from '../ui/DashboardSkeleton';
import { staggerContainer } from '../ui/animations';

const DashboardStats: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { stats, loading } = useAdminDashboardData();

  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      data-admin-search-id="dashboard-stats"
      className={`admin-stats-panel overflow-hidden rounded-admin-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-admin-sm${
        loading ? ' admin-section-panel--loading' : ''
      }`}
      aria-label={t('admin.dashboard.stats.aria')}
      aria-busy={loading}
    >
      {loading ? (
        <DashboardStatsSkeleton />
      ) : (
        <motion.div
          key="stats-loaded"
          className="admin-stats-grid"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {stats.map((stat, index) => (
            <DashboardStatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              index={index}
              onClick={() => navigate(stat.route)}
            />
          ))}
        </motion.div>
      )}
    </motion.section>
  );
};

export default DashboardStats;
