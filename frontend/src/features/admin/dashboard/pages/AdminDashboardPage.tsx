import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import DashboardStats from '../components/DashboardStats';
import CriticalAlerts from '../components/CriticalAlerts';
import RecentActivity from '../components/RecentActivity';
import ActivityOverview from '../components/ActivityOverview';
import DashboardPageHero from '../components/DashboardPageHero';
import { AdminDashboardProvider, useAdminDashboardContext } from '../context/AdminDashboardContext';
import { useAdminPreferences } from '../../account/context/AdminPreferencesContext';
import { useDashboardLayout, type DashboardSectionId } from '../../account/hooks/useDashboardLayout';
import { staggerContainer } from '../ui/animations';

const AdminDashboardContent: FunctionComponent = () => {
  const { error } = useAdminDashboardContext();
  const { preferences } = useAdminPreferences();
  const { sectionOrder } = useDashboardLayout();

  const sectionNodes: Record<DashboardSectionId, ReactNode> = {
    stats: <DashboardStats key="stats" />,
    overview: <ActivityOverview key="overview" />,
    'alerts-row': (
      <div key="alerts-row" className="flex w-full min-w-0 flex-col gap-5 sm:gap-6">
        <CriticalAlerts />
        <RecentActivity />
      </div>
    ),
  };

  const pageSpacing = preferences.compactMode
    ? 'space-y-4 pb-5 sm:space-y-4'
    : preferences.dashboardPersonalization
      ? 'space-y-5 pb-6 sm:space-y-5 md:space-y-6'
      : 'space-y-5 pb-6 sm:space-y-6 md:space-y-7';

  return (
    <AdminLayout>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className={`mx-auto w-full min-w-0 max-w-[1680px] ${pageSpacing} ${
          preferences.dashboardPersonalization ? 'admin-dashboard-personalized' : ''
        }`}
      >
        <DashboardPageHero />

        {error ? (
          <div
            role="alert"
            className="rounded-admin-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300"
          >
            {error}
          </div>
        ) : null}

        {sectionOrder.map((id) => sectionNodes[id])}
      </motion.div>
    </AdminLayout>
  );
};

const AdminDashboardPage: FunctionComponent = () => (
  <AdminDashboardProvider>
    <AdminDashboardContent />
  </AdminDashboardProvider>
);

export default AdminDashboardPage;
