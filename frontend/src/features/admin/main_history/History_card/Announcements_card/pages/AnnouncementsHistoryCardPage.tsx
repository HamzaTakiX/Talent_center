import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import AnnouncementsStatsGrid from '../components/AnnouncementsStatsGrid';
import AnnouncementsTimelineList from '../components/AnnouncementsTimelineList';

const AnnouncementsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<AnnouncementsStatsGrid />} timeline={<AnnouncementsTimelineList />} />
);

export default AnnouncementsHistoryCardPage;
