import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import { AdminStatChartSection } from '../../../../ui';
import StudentsStatsGrid from '../components/StudentsStatsGrid';
import StudentsTimelineList from '../components/StudentsTimelineList';

const StudentsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<StudentsStatsGrid />} chart={<AdminStatChartSection chartId="history-students" />}
      timeline={<StudentsTimelineList />} />
);

export default StudentsHistoryCardPage;
