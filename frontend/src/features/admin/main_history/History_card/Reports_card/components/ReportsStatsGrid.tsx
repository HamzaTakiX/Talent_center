import { FunctionComponent } from 'react';
import { reportsStats } from '../data/reportsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const ReportsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={reportsStats} columns={4} />
);

export default ReportsStatsGrid;
