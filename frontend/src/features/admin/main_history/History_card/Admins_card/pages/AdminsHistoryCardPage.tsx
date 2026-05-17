import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import AdminsStatsGrid from '../components/AdminsStatsGrid';
import AdminsTimelineList from '../components/AdminsTimelineList';

const AdminsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<AdminsStatsGrid />} timeline={<AdminsTimelineList />} />
);

export default AdminsHistoryCardPage;
