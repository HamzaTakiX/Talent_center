import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import ReportsStatsGrid from '../components/ReportsStatsGrid';
import ReportsTimelineList from '../components/ReportsTimelineList';

const ReportsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<ReportsStatsGrid />} timeline={<ReportsTimelineList />} />
);

export default ReportsHistoryCardPage;
