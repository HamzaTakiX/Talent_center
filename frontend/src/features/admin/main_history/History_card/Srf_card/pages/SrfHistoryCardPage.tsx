import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import { AdminStatChartSection } from '../../../../ui';
import SrfStatsGrid from '../components/SrfStatsGrid';
import SrfTimelineList from '../components/SrfTimelineList';

const SrfHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<SrfStatsGrid />} chart={<AdminStatChartSection chartId="history-srf" />}
      timeline={<SrfTimelineList />} />
);

export default SrfHistoryCardPage;
