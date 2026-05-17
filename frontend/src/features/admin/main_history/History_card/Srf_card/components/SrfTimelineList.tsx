import { FunctionComponent } from 'react';
import { srfHistoryRows } from '../data/srfHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const SrfTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={srfHistoryRows} />
);

export default SrfTimelineList;
