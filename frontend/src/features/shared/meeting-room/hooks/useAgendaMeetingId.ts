import { useMemo } from 'react';
import { useScheduledMeetings } from './useScheduledMeetings';
import {
  resolveAgendaMeetingId,
  type ResolveAgendaMeetingIdOptions,
} from '../utils/resolveAgendaMeetingId';

export function useAgendaMeetingId(options: ResolveAgendaMeetingIdOptions) {
  const { meetings, loading } = useScheduledMeetings();
  const needsResolution =
    options.explicitMeetingId == null &&
    (options.startAt != null || options.studentDisplayName != null);

  const meetingId = useMemo(
    () => resolveAgendaMeetingId(meetings, options),
    [meetings, options.explicitMeetingId, options.startAt, options.studentDisplayName],
  );

  return {
    meetingId,
    resolving: loading && needsResolution,
  };
}
