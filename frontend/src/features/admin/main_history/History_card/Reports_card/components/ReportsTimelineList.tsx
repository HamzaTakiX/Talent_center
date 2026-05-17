import { FunctionComponent } from 'react';
import { reportsHistoryRows } from '../data/reportsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const ReportsTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={reportsHistoryRows} />
);

export default ReportsTimelineList;
