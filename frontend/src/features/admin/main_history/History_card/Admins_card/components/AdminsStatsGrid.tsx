import { FunctionComponent } from 'react';
import { adminsStats } from '../data/adminsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const AdminsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={adminsStats} columns={4} />
);

export default AdminsStatsGrid;
