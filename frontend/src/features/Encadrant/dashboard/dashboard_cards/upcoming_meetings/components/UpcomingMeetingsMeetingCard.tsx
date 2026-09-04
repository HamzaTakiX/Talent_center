import { FunctionComponent } from 'react';
import { Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UPCOMING_MEETINGS_PRIMARY_ACTION } from '../constants/upcomingMeetingsLayout';
import { AgendaMeetingJoinButton, MeetingEntityCard } from '../../../../../shared/meeting-room';
import { useEncadrantStudentProfileId } from '../../../../../shared/meeting-room/hooks/useEncadrantStudentProfileId';
import type { MeetingType, UpcomingMeeting } from '../types';

interface UpcomingMeetingsMeetingCardProps {
  meeting: UpcomingMeeting;
}

const TYPE_LABEL_KEY: Record<MeetingType, string> = {
  'in-person': 'encadrant.agenda.meetingType.inPerson',
  online: 'encadrant.agenda.meetingType.online',
};

const UpcomingMeetingsMeetingCard: FunctionComponent<UpcomingMeetingsMeetingCardProps> = ({
  meeting,
}) => {
  const { t } = useTranslation();
  const studentProfileId = useEncadrantStudentProfileId(meeting.student);

  return (
    <MeetingEntityCard
      portal="encadrant"
      participantName={meeting.student}
      title={t(TYPE_LABEL_KEY[meeting.type])}
      startAt={meeting.plannedStart}
      dateTimeLabel={`${meeting.date} · ${meeting.time}`}
      duration={meeting.duration}
      meetingType={meeting.type === 'online' ? 'online' : 'in-person'}
      status="upcoming"
      className="bg-[var(--admin-bg-elevated)]"
      primaryAction={
        meeting.showJoinMeeting ? (
          <AgendaMeetingJoinButton
            portal="encadrant"
            mode="video"
            meetingId={meeting.meetingId}
            studentDisplayName={meeting.student}
            startAt={meeting.plannedStart}
            studentProfileId={studentProfileId}
            title={t('encadrant.agenda.meetingWith', { name: meeting.student })}
            className={UPCOMING_MEETINGS_PRIMARY_ACTION}
          >
            <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            {t('encadrant.agenda.joinMeeting')}
          </AgendaMeetingJoinButton>
        ) : undefined
      }
    />
  );
};

export default UpcomingMeetingsMeetingCard;
