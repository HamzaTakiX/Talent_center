import { FunctionComponent } from 'react';
import { encadrantsStats } from '../data/encadrantsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const EncadrantsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={encadrantsStats} columns={4} />
);

export default EncadrantsStatsGrid;
