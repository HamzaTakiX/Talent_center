import { FunctionComponent, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import DashboardSectionHeader from './DashboardSectionHeader';
import DashboardPanel from '../ui/DashboardPanel';
import RecentActivitySkeleton from './RecentActivitySkeleton';
import AdminSectionEmptyState from '../../ui/AdminSectionEmptyState';
import { easePremium, scaleTap } from '../ui/animations';

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const RecentActivityViewAllButton: FunctionComponent<{ empty?: boolean }> = ({ empty = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={`admin-activity-view-all-footer${empty ? ' px-3 pb-4 pt-1 sm:px-4 sm:pb-5' : ''}`}>
      <motion.button
        type="button"
        className={`admin-activity-view-all-btn${empty ? ' admin-activity-view-all-btn--empty' : ''}`}
        onClick={() => navigate('/admin/history')}
        whileTap={scaleTap.whileTap}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easePremium, delay: empty ? 0 : 0.12 }}
      >
        <span>{t('admin.dashboard.activity.viewHistory')}</span>
        <span className="admin-activity-view-all-btn__icon" aria-hidden>
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2.25} />
        </span>
      </motion.button>
    </div>
  );
};

const RecentActivityRow: FunctionComponent<{
  action: string;
  user: string;
  time: string;
  index: number;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}> = ({ action, user, time, index, onClick }) => (
  <motion.button
    type="button"
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.05 * index, duration: 0.3 }}
    whileHover={{ backgroundColor: 'var(--admin-row-hover)' }}
    whileTap={scaleTap.whileTap}
    onClick={onClick}
    className="admin-list-row group flex w-full items-center gap-2 px-4 py-3 sm:px-5"
  >
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand)] text-[11px] font-semibold text-white">
        {getInitials(user)}
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-sm font-medium text-[var(--admin-text)]">{action}</span>
        <span className="mt-0.5 block truncate text-xs text-[var(--admin-text-secondary)]">
          {user} · {time}
        </span>
      </span>
    </span>
    <ChevronRight
      className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--admin-brand)] group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
      strokeWidth={2}
      aria-hidden
    />
  </motion.button>
);

const RecentActivity: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recentActivity, loading } = useAdminDashboardData();

  return (
    <DashboardPanel
      data-admin-search-id="dashboard-activity"
      className={`admin-section-panel h-full${loading ? ' admin-section-panel--loading' : ''}`}
      aria-busy={loading}
    >
      <DashboardSectionHeader
        icon={<Clock strokeWidth={1.75} aria-hidden />}
        title={t('admin.dashboard.activity.title')}
        subtitle={t('admin.dashboard.activity.subtitle')}
      />

      {loading ? (
        <RecentActivitySkeleton />
      ) : recentActivity.length === 0 ? (
        <div className="flex flex-col">
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('admin.dashboard.activity.empty')}
            description={t('admin.dashboard.activity.emptyDesc')}
          />
          <RecentActivityViewAllButton empty />
        </div>
      ) : (
        <motion.div className="admin-section-list flex flex-col">
          {recentActivity.map((activity, index) => (
            <RecentActivityRow
              key={activity.id}
              action={activity.action}
              user={activity.user}
              time={activity.time}
              index={index}
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                navigate('/admin/history');
              }}
            />
          ))}
          <RecentActivityViewAllButton />
        </motion.div>
      )}
    </DashboardPanel>
  );
};

export default RecentActivity;
