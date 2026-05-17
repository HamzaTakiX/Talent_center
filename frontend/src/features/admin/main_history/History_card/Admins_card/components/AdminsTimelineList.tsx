import { FunctionComponent } from 'react';
import { adminsRows } from '../data/adminsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const AdminsTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={adminsRows} />
);

export default AdminsTimelineList;
