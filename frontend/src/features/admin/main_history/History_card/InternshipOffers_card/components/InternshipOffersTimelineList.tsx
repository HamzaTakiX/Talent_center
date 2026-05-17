import { FunctionComponent } from 'react';
import { internshipOffersRows } from '../data/internshipOffersHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const InternshipOffersTimelineList: FunctionComponent = () => (
  <AdminHistoryTimelineList embedded rows={internshipOffersRows} />
);

export default InternshipOffersTimelineList;
