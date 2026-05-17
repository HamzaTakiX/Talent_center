import { FunctionComponent } from 'react';
import HistoryCardPageShell from '../../../components/HistoryCardPageShell';
import { AdminStatChartSection } from '../../../../ui';
import ChatStatsGrid from '../components/ChatStatsGrid';
import ChatTimelineList from '../components/ChatTimelineList';

const ChatHistoryCardPage: FunctionComponent = () => (
  <HistoryCardPageShell stats={<ChatStatsGrid />} chart={<AdminStatChartSection chartId="history-chat" />}
      timeline={<ChatTimelineList />} />
);

export default ChatHistoryCardPage;
