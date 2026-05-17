import { FunctionComponent } from 'react';
import { chatHistoryRows } from '../data/chatHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const ChatTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={chatHistoryRows} />
);

export default ChatTimelineList;
