import { FunctionComponent } from 'react';
import { CalendarX2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminSearchEmptyState from '../../../admin/ui/AdminSearchEmptyState';

export type MeetingEmptyStateContext = 'noUpcoming' | 'noMeetings' | 'noScheduled';

interface MeetingEmptyStateProps {
  context?: MeetingEmptyStateContext;
  variant?: 'panel' | 'inline';
  className?: string;
}

const TITLE_KEY: Record<MeetingEmptyStateContext, string> = {
  noUpcoming: 'meetingRoom.empty.noUpcomingTitle',
  noMeetings: 'meetingRoom.empty.noMeetingsTitle',
  noScheduled: 'meetingRoom.empty.noScheduledTitle',
};

const DESCRIPTION_KEY: Record<MeetingEmptyStateContext, string> = {
  noUpcoming: 'meetingRoom.empty.noUpcomingDesc',
  noMeetings: 'meetingRoom.empty.noMeetingsDesc',
  noScheduled: 'meetingRoom.empty.noScheduledDesc',
};

export const MeetingEmptyState: FunctionComponent<MeetingEmptyStateProps> = ({
  context = 'noMeetings',
  variant = 'panel',
  className,
}) => {
  return (
    <AdminSearchEmptyState
      icon={<CalendarX2 className="h-8 w-8" strokeWidth={1.5} aria-hidden />}
      titleKey={TITLE_KEY[context]}
      descriptionKey={DESCRIPTION_KEY[context]}
      variant={variant}
      className={['w-full min-w-0 max-w-full box-border', className].filter(Boolean).join(' ')}
    />
  );
};
