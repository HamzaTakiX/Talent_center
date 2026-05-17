import { FunctionComponent } from 'react';
import { announcementsStats } from '../data/announcementsHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const AnnouncementsStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={announcementsStats} columns={4} />
);

export default AnnouncementsStatsGrid;
