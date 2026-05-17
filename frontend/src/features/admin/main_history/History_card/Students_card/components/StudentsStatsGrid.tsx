import { FunctionComponent } from 'react';
import { studentsStats } from '../data/studentsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const StudentsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={studentsStats} columns={4} />
);

export default StudentsStatsGrid;
