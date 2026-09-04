import type { MeetingMediaMode, MeetingPortal } from './index';

export type MeetingRequestStatus = 'pending' | 'accepted' | 'declined';

export interface ChatMeetingRequestPayload {
  requestId: string;
  mode: MeetingMediaMode;
  status: MeetingRequestStatus;
  title?: string;
}

export interface SupervisionMeetingChatConfig {
  portal: MeetingPortal;
  /** Required for encadrant portal when starting a session with a student. */
  studentProfileId?: number;
}
