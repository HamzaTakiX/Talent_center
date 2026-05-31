import { FunctionComponent } from 'react';
import {
  UPCOMING_MEETINGS_LIST,
  UPCOMING_MEETINGS_SECTION_CARD,
} from '../constants/upcomingMeetingsLayout';
import { upcomingMeetingsMock } from '../data';
import UpcomingMeetingsMeetingCard from './UpcomingMeetingsMeetingCard';

const UpcomingMeetingsScheduleSection: FunctionComponent = () => (
  <section className={UPCOMING_MEETINGS_SECTION_CARD} aria-label="Meeting schedule">
    <header className="flex min-w-0 flex-col gap-1">
      <h2 className="m-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg">Schedule</h2>
      <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
        Manage your upcoming meetings with students
      </p>
    </header>

    <div className={UPCOMING_MEETINGS_LIST}>
      {upcomingMeetingsMock.map((meeting) => (
        <UpcomingMeetingsMeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  </section>
);

export default UpcomingMeetingsScheduleSection;
