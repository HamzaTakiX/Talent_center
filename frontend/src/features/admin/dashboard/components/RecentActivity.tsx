import { FunctionComponent, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import DashboardSectionHeader from './DashboardSectionHeader';
import DashboardPanel from '../ui/DashboardPanel';
import { scaleTap } from '../ui/animations';

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
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
  const { recentActivity } = useAdminDashboardData();

  const handleActivityClick = (activityId: string) => {
    console.log(`Clicked on activity ${activityId}`);
  };

  return (
    <DashboardPanel data-admin-search-id="dashboard-activity" className="admin-section-panel h-full">
      <DashboardSectionHeader
        icon={<Clock strokeWidth={1.75} aria-hidden />}
        title={t('admin.dashboard.activity.title')}
        subtitle={t('admin.dashboard.activity.subtitle')}
      />

      <motion.div className="admin-section-list flex flex-col">
        {recentActivity.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[var(--admin-text-secondary)] sm:px-5">
            {t('admin.dashboard.activity.empty', { defaultValue: 'No recent activity on the platform.' })}
          </p>
        ) : (
          recentActivity.map((activity, index) => (
            <RecentActivityRow
              key={activity.id}
              action={activity.action}
              user={activity.user}
              time={activity.time}
              index={index}
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleActivityClick(activity.id);
              }}
            />
          ))
        )}
      </motion.div>
    </DashboardPanel>
  );
};

export default RecentActivity;
