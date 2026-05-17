import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import MeetingsStatsGrid from '../components/MeetingsStatsGrid';
import MeetingsTimelineList from '../components/MeetingsTimelineList';

const MeetingsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<MeetingsStatsGrid />} timeline={<MeetingsTimelineList />} />
);

export default MeetingsHistoryCardPage;
