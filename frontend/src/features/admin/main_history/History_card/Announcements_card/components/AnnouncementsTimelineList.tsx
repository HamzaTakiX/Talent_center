import { FunctionComponent } from 'react';
import { announcementsHistoryRows } from '../data/announcementsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const AnnouncementsTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={announcementsHistoryRows} />
);

export default AnnouncementsTimelineList;
