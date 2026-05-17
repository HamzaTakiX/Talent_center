import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyStatsMock } from '../data/historyMockData';
import HistoryStatCard from './HistoryStatCard';
import AdminKpiGrid from '../../ui/AdminKpiGrid';

const routeByKey: Record<string, string> = {
  total_actions: '/admin/history/total-actions',
  students: '/admin/history/students',
  admins: '/admin/history/admins',
  encadrants: '/admin/history/encadrants',
  internship_offers: '/admin/history/internship-offers',
  applications: '/admin/history/applications',
  announcements: '/admin/history/announcements',
  documents: '/admin/history/documents',
  srf: '/admin/history/srf',
  chat: '/admin/history/chat',
  reports: '/admin/history/reports',
  tasks: '/admin/history/tasks',
  meetings: '/admin/history/meetings',
};

const HistoryStatsGrid: FunctionComponent = () => {
  const navigate = useNavigate();

  const primaryStats = historyStatsMock.slice(0, 7);
  const secondaryStats = historyStatsMock.slice(7);

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 md:gap-7">
    <AdminKpiGrid columns={4}>
      {primaryStats.map((item, index) => (
        <HistoryStatCard
          key={item.key}
          item={item}
          index={index}
          onClick={() => {
            const route = routeByKey[item.key];
            if (route) {
              navigate(route);
              return;
            }
            console.log('History stat clicked', item.key);
          }}
        />
      ))}
    </AdminKpiGrid>
    <AdminKpiGrid columns={4}>
      {secondaryStats.map((item, index) => (
        <HistoryStatCard
          key={item.key}
          item={item}
          index={index + primaryStats.length}
          onClick={() => {
            const route = routeByKey[item.key];
            if (route) {
              navigate(route);
              return;
            }
            console.log('History stat clicked', item.key);
          }}
        />
      ))}
    </AdminKpiGrid>
    </div>
  );
};

export default HistoryStatsGrid;
