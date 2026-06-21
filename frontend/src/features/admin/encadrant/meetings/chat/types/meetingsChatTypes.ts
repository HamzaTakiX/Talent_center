export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';

export interface MeetingMessage {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  separatorBefore?: string;
}

import type { StudentAcademicFields } from '../../../../shared/chat-filters/studentAcademicChatFilterTypes';

export interface MeetingConversation extends StudentAcademicFields {
  id: string;
  participantInitials: string;
  participantName: string;
  meetingTitle: string;
  meetingDate: string;
  meetingStatus: MeetingStatus;
  encadrantName: string;
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  resolved: boolean;
  archived: boolean;
  urgent: boolean;
  messages: MeetingMessage[];
}

import {
  EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  type StudentAcademicChatFilters,
} from '../../../../shared/chat-filters/studentAcademicChatFilterTypes';

export interface MeetingInboxFilters extends StudentAcademicChatFilters {
  unread: boolean;
  urgent: boolean;
  archived: boolean;
  statuses: MeetingStatus[];
}

export const EMPTY_MEETING_FILTERS: MeetingInboxFilters = {
  ...EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  unread: false,
  urgent: false,
  archived: false,
  statuses: [],
};

export interface MeetingInboxStats {
  unread: number;
  pending: number;
  resolved: number;
}
