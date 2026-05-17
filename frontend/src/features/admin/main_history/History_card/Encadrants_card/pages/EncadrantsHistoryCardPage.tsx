import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import EncadrantsStatsGrid from '../components/EncadrantsStatsGrid';
import EncadrantsTimelineList from '../components/EncadrantsTimelineList';

const EncadrantsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<EncadrantsStatsGrid />} timeline={<EncadrantsTimelineList />} />
);

export default EncadrantsHistoryCardPage;
