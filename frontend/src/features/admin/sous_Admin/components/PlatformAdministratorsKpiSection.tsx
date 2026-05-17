import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboardStatCard from '../../student/components/StudentDashboardStatCard';
import { platformAdministratorsKpiStats } from '../data/platformAdministratorsKpiStats';
import { PLATFORM_ADMIN_KPI_STAT_TO_PATH } from '../constants/platformAdministratorsNavigation';
import AdminKpiGrid from '../../ui/AdminKpiGrid';

const PlatformAdministratorsKpiSection: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <AdminKpiGrid columns={5}>
      {platformAdministratorsKpiStats.map((stat, index) => (
        <StudentDashboardStatCard
          key={stat.statKey}
          label={stat.label}
          labelKey={stat.labelKey}
          value={stat.value}
          IconComponent={stat.Icon}
          iconBgClass={stat.iconBgClass}
          index={index}
          onClick={() => navigate(PLATFORM_ADMIN_KPI_STAT_TO_PATH[stat.statKey])}
        />
      ))}
    </AdminKpiGrid>
  );
};

export default PlatformAdministratorsKpiSection;
