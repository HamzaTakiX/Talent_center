import { FunctionComponent } from 'react';
import { UPCOMING_MEETINGS_STATS_GRID } from '../constants/upcomingMeetingsLayout';
import { upcomingMeetingsSummaryMock } from '../data';
import UpcomingMeetingsSummaryCard from './UpcomingMeetingsSummaryCard';

const UpcomingMeetingsSummaryGrid: FunctionComponent = () => (
  <section aria-label="Upcoming meetings summary" className={UPCOMING_MEETINGS_STATS_GRID}>
    {upcomingMeetingsSummaryMock.map((stat) => (
      <UpcomingMeetingsSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default UpcomingMeetingsSummaryGrid;
