import { FunctionComponent } from 'react';
import { meetingsStats } from '../data/meetingsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const MeetingsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={meetingsStats} columns={4} />
);

export default MeetingsStatsGrid;
