import { FunctionComponent } from 'react';
import { useAgendaMeetingId } from '../hooks/useAgendaMeetingId';
import type { MeetingMediaMode, MeetingPortal } from '../types';
import { MeetingActionButton } from './MeetingActionButton';

interface AgendaMeetingJoinButtonProps {
  portal: MeetingPortal;
  mode?: MeetingMediaMode;
  meetingId?: number;
  studentDisplayName?: string;
  startAt?: string;
  studentProfileId?: number;
  title?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

/** Join button for scheduled agenda events — resolves backend meeting_id before session create. */
export const AgendaMeetingJoinButton: FunctionComponent<AgendaMeetingJoinButtonProps> = ({
  portal,
  mode = 'video',
  meetingId: explicitMeetingId,
  studentDisplayName,
  startAt,
  studentProfileId,
  title,
  className,
  children,
  disabled = false,
}) => {
  const { meetingId: resolvedMeetingId, resolving } = useAgendaMeetingId({
    explicitMeetingId,
    studentDisplayName,
    startAt,
  });

  return (
    <MeetingActionButton
      portal={portal}
      mode={mode}
      meetingId={resolvedMeetingId}
      studentProfileId={resolvedMeetingId ? undefined : studentProfileId}
      title={title}
      className={className}
      disabled={disabled || resolving}
      externalLoading={resolving}
    >
      {children}
    </MeetingActionButton>
  );
};
