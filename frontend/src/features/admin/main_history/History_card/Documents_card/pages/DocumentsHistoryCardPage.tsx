import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import { AdminStatChartSection } from '../../../../ui';
import DocumentsStatsGrid from '../components/DocumentsStatsGrid';
import DocumentsTimelineList from '../components/DocumentsTimelineList';

const DocumentsHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<DocumentsStatsGrid />} chart={<AdminStatChartSection chartId="history-documents" />}
      timeline={<DocumentsTimelineList />} />
);

export default DocumentsHistoryCardPage;
