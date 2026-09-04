import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingSessionsApi } from '../api/meetingSessionsApi';
import { meetingRoomPathForPortal } from '../constants/routes';
import type { CreateMeetingSessionRequest, MeetingMediaMode, MeetingPortal } from '../types';

export interface StartMeetingOptions {
  mode?: MeetingMediaMode;
  meetingId?: number;
  studentProfileId?: number;
  encadrantProfileId?: number;
  title?: string;
  portal: MeetingPortal;
}

export function useMeetingNavigation(portal: MeetingPortal) {
  const navigate = useNavigate();

  const startMeeting = useCallback(
    async (options: StartMeetingOptions) => {
      const mode = options.mode ?? 'video';
      const payload: CreateMeetingSessionRequest = {
        mode,
        meeting_id: options.meetingId,
        student_profile_id: options.studentProfileId,
        encadrant_profile_id: options.encadrantProfileId,
        title: options.title,
      };
      const session = await meetingSessionsApi.createSession(payload);
      navigate(meetingRoomPathForPortal(portal, session.session_id, mode));
    },
    [navigate, portal],
  );

  return { startMeeting };
}
