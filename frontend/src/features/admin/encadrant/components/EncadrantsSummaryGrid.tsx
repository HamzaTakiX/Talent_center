import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import EncadrantSummaryStatCard from './EncadrantSummaryStatCard';
import { ENCADRANT_CARD_ROUTES, encadrantsSummaryStats } from '../data/encadrantsMockData';
import AdminKpiGrid from '../../ui/AdminKpiGrid';

const EncadrantsSummaryGrid: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <AdminKpiGrid columns={4}>
      {encadrantsSummaryStats.map((stat, index) => (
        <EncadrantSummaryStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          IconComponent={stat.Icon}
          iconBgClass={stat.iconBgClass}
          index={index}
          onClick={() => navigate(ENCADRANT_CARD_ROUTES[index])}
        />
      ))}
    </AdminKpiGrid>
  );
};

export default EncadrantsSummaryGrid;
