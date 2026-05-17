import { FunctionComponent } from 'react';
import { applicationsHistoryRows } from '../data/applicationsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const ApplicationsTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={applicationsHistoryRows} />
);

export default ApplicationsTimelineList;
