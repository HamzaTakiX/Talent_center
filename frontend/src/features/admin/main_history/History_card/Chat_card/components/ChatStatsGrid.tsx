import { FunctionComponent } from 'react';
import { chatStats } from '../data/chatHistoryMock';
import AdminHistorySubStatsGrid from '../../../../ui/AdminHistorySubStatsGrid';

const ChatStatsGrid: FunctionComponent = () => (
  <AdminHistorySubStatsGrid stats={chatStats} columns={4} />
);

export default ChatStatsGrid;
