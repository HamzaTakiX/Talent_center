import { FunctionComponent } from 'react';
import { Calendar, Clock, MapPin, Pencil, Trash2, Video } from 'lucide-react';
import {
  UPCOMING_MEETINGS_ACTIONS_ROW,
  UPCOMING_MEETINGS_DETAIL_ITEM,
  UPCOMING_MEETINGS_DETAILS_ROW,
  UPCOMING_MEETINGS_MEETING_CARD,
  UPCOMING_MEETINGS_PRIMARY_ACTION,
  UPCOMING_MEETINGS_SECONDARY_ACTION,
} from '../constants/upcomingMeetingsLayout';
import {
  UPCOMING_MEETINGS_HEADER_ICON,
  UPCOMING_MEETINGS_TYPE_BADGE,
} from '../constants/upcomingMeetingsStyles';
import type { UpcomingMeeting } from '../types';

interface UpcomingMeetingsMeetingCardProps {
  meeting: UpcomingMeeting;
}

const UpcomingMeetingsMeetingCard: FunctionComponent<UpcomingMeetingsMeetingCardProps> = ({
  meeting,
}) => {
  const HeaderIcon = meeting.type === 'online' ? Video : MapPin;
  const LocationIcon = meeting.type === 'online' ? Video : MapPin;

  return (
    <article className={UPCOMING_MEETINGS_MEETING_CARD}>
      <div className="flex min-w-0 gap-3">
        <div className={UPCOMING_MEETINGS_HEADER_ICON}>
          <HeaderIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg">
            {meeting.student}
          </h3>
          <p className="m-0 mt-0.5 text-sm font-normal leading-5 text-[#717182]">{meeting.date}</p>
        </div>
      </div>

      <div className={UPCOMING_MEETINGS_DETAILS_ROW}>
        <span className={UPCOMING_MEETINGS_DETAIL_ITEM}>
          <Clock className="h-4 w-4 shrink-0 text-[#717182]" strokeWidth={1.75} aria-hidden />
          {meeting.time}
        </span>
        <span className={UPCOMING_MEETINGS_DETAIL_ITEM}>
          <Calendar className="h-4 w-4 shrink-0 text-[#717182]" strokeWidth={1.75} aria-hidden />
          {meeting.duration}
        </span>
        <span className={UPCOMING_MEETINGS_DETAIL_ITEM}>
          <LocationIcon className="h-4 w-4 shrink-0 text-[#717182]" strokeWidth={1.75} aria-hidden />
          {meeting.location}
        </span>
        <span
          className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium leading-4 ${UPCOMING_MEETINGS_TYPE_BADGE[meeting.type]}`}
        >
          {meeting.typeLabel}
        </span>
      </div>

      <div className={UPCOMING_MEETINGS_ACTIONS_ROW}>
        {meeting.showJoinMeeting && (
          <button type="button" className={UPCOMING_MEETINGS_PRIMARY_ACTION}>
            <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Join Meeting
          </button>
        )}
        <button type="button" className={UPCOMING_MEETINGS_SECONDARY_ACTION}>
          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Edit
        </button>
        <button type="button" className={UPCOMING_MEETINGS_SECONDARY_ACTION}>
          <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Cancel
        </button>
      </div>
    </article>
  );
};

export default UpcomingMeetingsMeetingCard;
