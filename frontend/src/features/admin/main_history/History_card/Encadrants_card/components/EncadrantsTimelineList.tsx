import { FunctionComponent } from 'react';
import { encadrantsRows } from '../data/encadrantsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const EncadrantsTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={encadrantsRows} />
);

export default EncadrantsTimelineList;
