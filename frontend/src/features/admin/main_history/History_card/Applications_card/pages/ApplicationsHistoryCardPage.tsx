import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import { AdminStatChartSection } from '../../../../ui';
import ApplicationsStatsGrid from '../components/ApplicationsStatsGrid';
import ApplicationsTimelineList from '../components/ApplicationsTimelineList';

const ApplicationsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<ApplicationsStatsGrid />} chart={<AdminStatChartSection chartId="history-applications" />}
      timeline={<ApplicationsTimelineList />} />
);

export default ApplicationsHistoryCardPage;
