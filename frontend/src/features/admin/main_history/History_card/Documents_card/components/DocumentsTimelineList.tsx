import { FunctionComponent } from 'react';
import { documentsHistoryRows } from '../data/documentsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const DocumentsTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={documentsHistoryRows} />
);

export default DocumentsTimelineList;
