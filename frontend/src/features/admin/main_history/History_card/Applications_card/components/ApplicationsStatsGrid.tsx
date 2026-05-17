import { FunctionComponent } from 'react';
import { applicationsStats } from '../data/applicationsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const ApplicationsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={applicationsStats} columns={4} />
);

export default ApplicationsStatsGrid;
