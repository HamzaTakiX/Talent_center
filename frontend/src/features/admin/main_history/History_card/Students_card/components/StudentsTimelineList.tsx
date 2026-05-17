import { FunctionComponent } from 'react';
import { studentsRows } from '../data/studentsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const StudentsTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={studentsRows} />
);

export default StudentsTimelineList;
