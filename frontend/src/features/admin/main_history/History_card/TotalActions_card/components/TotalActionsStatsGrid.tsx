import { FunctionComponent } from 'react';
import { totalActionsStats } from '../data/totalActionsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const TotalActionsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={totalActionsStats} columns={4} />
);

export default TotalActionsStatsGrid;
