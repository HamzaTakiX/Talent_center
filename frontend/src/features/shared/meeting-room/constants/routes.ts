import type { MeetingMediaMode, MeetingPortal } from '../types';

export const STUDENT_MEETING_ROOM_PATH = '/student/encadrant/meeting';

export const ENCADRANT_MEETING_ROOM_PATH = '/encadrant/meeting';

export function studentMeetingRoomPath(sessionId: string, mode: MeetingMediaMode = 'video'): string {
  return `${STUDENT_MEETING_ROOM_PATH}/${sessionId}?mode=${mode}`;
}

export function encadrantMeetingRoomPath(sessionId: string, mode: MeetingMediaMode = 'video'): string {
  return `${ENCADRANT_MEETING_ROOM_PATH}/${sessionId}?mode=${mode}`;
}

export function meetingRoomPathForPortal(
  portal: MeetingPortal,
  sessionId: string,
  mode: MeetingMediaMode = 'video',
): string {
  return portal === 'student'
    ? studentMeetingRoomPath(sessionId, mode)
    : encadrantMeetingRoomPath(sessionId, mode);
}

export function chatPathForPortal(portal: MeetingPortal): string {
  return portal === 'student' ? '/student/encadrant/chat' : '/encadrant/chat';
}

export function backPathForPortal(portal: MeetingPortal): string {
  return portal === 'student' ? '/student/encadrant' : '/encadrant/workspace';
}

export function agendaPathForPortal(portal: MeetingPortal): string {
  return portal === 'student' ? '/student/encadrant/agenda' : '/encadrant/agenda';
}

export function workspacePathForPortal(portal: MeetingPortal): string {
  return portal === 'student' ? '/student/encadrant/workspace' : '/encadrant/workspace';
}
