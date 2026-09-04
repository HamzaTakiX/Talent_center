export type MeetingMediaMode = 'video' | 'voice';

export type MeetingPortal = 'student' | 'encadrant';

export type MeetingConnectionState =
  | 'preparing'
  | 'loading'
  | 'joining'
  | 'connected'
  | 'waiting'
  | 'reconnecting'
  | 'ended'
  | 'error';

export interface MeetingParticipantInfo {
  profile_id: number | null;
  display_name: string;
  avatar_url?: string | null;
}

export interface MeetingSessionPayload {
  session_id: string;
  meeting_id: number;
  title: string;
  status: string;
  mode: MeetingMediaMode;
  jitsi_domain: string;
  jitsi_room_name: string;
  planned_start: string | null;
  student: MeetingParticipantInfo;
  encadrant: MeetingParticipantInfo;
}

export interface CollaborationContextPayload {
  role: 'student' | 'supervisor';
  student_profile_id?: number;
  encadrant_profile_id?: number;
  partner?: MeetingParticipantInfo;
  students?: MeetingParticipantInfo[];
}

export interface CreateMeetingSessionRequest {
  mode: MeetingMediaMode;
  meeting_id?: number;
  student_profile_id?: number;
  encadrant_profile_id?: number;
  title?: string;
}

export interface ScheduledMeetingSummary {
  meeting_id: number;
  session_id: string;
  title: string;
  planned_start: string | null;
  student: MeetingParticipantInfo;
}
