import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { UpcomingMeetingsScheduleSection, UpcomingMeetingsSummaryGrid } from '../components';
import { UPCOMING_MEETINGS_PAGE_ROOT } from '../constants/upcomingMeetingsLayout';

const UpcomingMeetingsPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Upcoming Meetings" headerSubtitle="Encadrant Portal">
    <div id="encadrant-upcoming-meetings-root" className={UPCOMING_MEETINGS_PAGE_ROOT}>
      <UpcomingMeetingsSummaryGrid />
      <UpcomingMeetingsScheduleSection />
    </div>
  </EncadrantLayout>
);

export default UpcomingMeetingsPage;
