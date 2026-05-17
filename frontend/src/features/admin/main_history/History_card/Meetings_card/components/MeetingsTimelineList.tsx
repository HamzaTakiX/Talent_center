import { FunctionComponent } from 'react';
import { meetingsHistoryRows } from '../data/meetingsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const MeetingsTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={meetingsHistoryRows} />
);

export default MeetingsTimelineList;
