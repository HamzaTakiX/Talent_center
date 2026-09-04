import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UPCOMING_MEETINGS_LIST,
  UPCOMING_MEETINGS_SECTION_CARD,
} from '../constants/upcomingMeetingsLayout';
import { upcomingMeetingsMock } from '../data';
import UpcomingMeetingsMeetingCard from './UpcomingMeetingsMeetingCard';

const UpcomingMeetingsScheduleSection: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section
      className={UPCOMING_MEETINGS_SECTION_CARD}
      aria-label={t('encadrant.dashboard.meetings.scheduledSection')}
    >
      <header className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
          {t('encadrant.dashboard.meetings.scheduledSection')}
        </h2>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
          {t('encadrant.dashboard.upcomingMeetings')}
        </p>
      </header>

      <div className={UPCOMING_MEETINGS_LIST}>
        {upcomingMeetingsMock.map((meeting) => (
          <UpcomingMeetingsMeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>
    </section>
  );
};

export default UpcomingMeetingsScheduleSection;
