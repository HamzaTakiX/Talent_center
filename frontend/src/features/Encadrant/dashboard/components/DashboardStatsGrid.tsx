import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENCADRANT_ASSIGNED_STUDENTS_PATH } from '../dashboard_cards/assigned_students/constants/routes';
import { ENCADRANT_REPORTS_PENDING_PATH } from '../dashboard_cards/reports_pending/constants/routes';
import { ENCADRANT_UPCOMING_MEETINGS_PATH } from '../dashboard_cards/upcoming_meetings/constants/routes';
import { ENCADRANT_STUDENTS_AT_RISK_PATH } from '../dashboard_cards/students_at_risk/constants/routes';
import { DASHBOARD_STATS_GRID } from '../constants/dashboardLayout';
import { dashboardStatsMock } from '../data';
import DashboardStatCard from './DashboardStatCard';

const DashboardStatsGrid: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <section aria-label="Dashboard statistics" className={DASHBOARD_STATS_GRID}>
      {dashboardStatsMock.map((stat) => (
        <DashboardStatCard
          key={stat.label}
          stat={stat}
          onClick={
            stat.label === 'Assigned Students'
              ? () => navigate(ENCADRANT_ASSIGNED_STUDENTS_PATH)
              : stat.label === 'Students at Risk'
                ? () => navigate(ENCADRANT_STUDENTS_AT_RISK_PATH)
                : stat.label === 'Reports Pending'
                  ? () => navigate(ENCADRANT_REPORTS_PENDING_PATH)
                  : stat.label === 'Upcoming Meetings'
                    ? () => navigate(ENCADRANT_UPCOMING_MEETINGS_PATH)
                    : undefined
          }
        />
      ))}
    </section>
  );
};

export default DashboardStatsGrid;
