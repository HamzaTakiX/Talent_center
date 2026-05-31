import { FunctionComponent } from 'react';
import EncadrantLayout from '../../components/EncadrantLayout';
import { DashboardStatsGrid, DashboardStudentsSection } from '../components';
import { DASHBOARD_PAGE_ROOT } from '../constants/dashboardLayout';

const DashboardPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Dashboard">
    <div id="encadrant-dashboard-root" className={DASHBOARD_PAGE_ROOT}>
      <DashboardStatsGrid />
      <DashboardStudentsSection />
    </div>
  </EncadrantLayout>
);

export default DashboardPage;
