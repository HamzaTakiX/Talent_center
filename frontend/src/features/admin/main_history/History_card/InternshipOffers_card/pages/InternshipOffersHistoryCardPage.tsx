import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import InternshipOffersStatsGrid from '../components/InternshipOffersStatsGrid';
import InternshipOffersTimelineList from '../components/InternshipOffersTimelineList';

const InternshipOffersHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<InternshipOffersStatsGrid />} timeline={<InternshipOffersTimelineList />} />
);

export default InternshipOffersHistoryCardPage;
