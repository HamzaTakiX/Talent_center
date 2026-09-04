export { default as MeetingRoomPage } from './pages/MeetingRoomPage';
export { MeetingActionButton, useMeetingAction } from './components/MeetingActionButton';
export { AgendaMeetingJoinButton } from './components/AgendaMeetingJoinButton';
export { MeetingEmptyState } from './components/MeetingEmptyState';
export { MeetingStatusBadge } from './components/MeetingStatusBadge';
export { MeetingEntityCard } from './components/MeetingEntityCard';
export { MeetingPreJoinPanel } from './components/MeetingPreJoinPanel';
export { MeetingParticipantAvatar } from './components/MeetingParticipantAvatar';
export { MeetingEndedPanel } from './components/MeetingEndedPanel';
export { ChatMeetingRequestBubble } from './components/chat/ChatMeetingRequestBubble';
export { ChatMeetingRequestComposerButton } from './components/chat/ChatMeetingRequestComposerButton';
export { meetingSessionsApi } from './api/meetingSessionsApi';
export { useCollaborationContext } from './hooks/useCollaborationContext';
export { useMeetingNavigation } from './hooks/useMeetingNavigation';
export {
  STUDENT_MEETING_ROOM_PATH,
  ENCADRANT_MEETING_ROOM_PATH,
  studentMeetingRoomPath,
  encadrantMeetingRoomPath,
  agendaPathForPortal,
  workspacePathForPortal,
} from './constants/routes';
export { registerMeetingRoomTranslations } from './i18n/registerMeetingRoomTranslations';
export {
  formatMeetingDateTime,
  formatMeetingDate,
  formatMeetingTime,
  normalizeMeetingStatus,
} from './utils/meetingDisplayUtils';
export type * from './types';
