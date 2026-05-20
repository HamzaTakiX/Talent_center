import { FunctionComponent } from 'react';
import EncadrantFilteredListLayout from '../../shared/components/EncadrantFilteredListLayout';

const UpcomingMeetingsListPage: FunctionComponent = () => (
  <EncadrantFilteredListLayout filter="meetings" chartId="encadrants-meetings-weekly" />
);

export default UpcomingMeetingsListPage;
