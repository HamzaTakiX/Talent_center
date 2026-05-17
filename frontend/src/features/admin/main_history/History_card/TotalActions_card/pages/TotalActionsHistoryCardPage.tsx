import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import { AdminStatChartSection } from '../../../../ui';
import TotalActionsStatsGrid from '../components/TotalActionsStatsGrid';
import TotalActionsTimelineList from '../components/TotalActionsTimelineList';

const TotalActionsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<TotalActionsStatsGrid />} chart={<AdminStatChartSection chartId="history-total-actions" />}
      timeline={<TotalActionsTimelineList />} />
);

export default TotalActionsHistoryCardPage;
