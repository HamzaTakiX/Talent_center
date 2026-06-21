export type AnnouncementCategory =
  | 'Academic'
  | 'Events'
  | 'Internship'
  | 'General'
  | 'Administrative';

export type AnnouncementPublishStatus =
  | 'Published'
  | 'Scheduled'
  | 'Draft'
  | 'Expired';

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';

export type AnnouncementMessage = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  separatorBefore?: string;
  read?: boolean;
  attachmentName?: string;
};

import type { StudentAcademicFields } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

export type AnnouncementConversation = StudentAcademicFields & {
  id: string;
  studentName: string;
  studentInitials: string;
  announcementTitle: string;
  category: AnnouncementCategory;
  publishStatus: AnnouncementPublishStatus;
  priority: AnnouncementPriority;
  publishDate: string;
  expiryDate: string;
  audience: string;
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  urgent: boolean;
  resolved: boolean;
  archived: boolean;
  messages: AnnouncementMessage[];
  studentEmail?: string;
  announcementBody?: string;
  announcementNotes?: string;
};

import {
  EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  type StudentAcademicChatFilters,
} from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

export type AnnouncementInboxFilters = StudentAcademicChatFilters & {
  categories: AnnouncementCategory[];
  statuses: AnnouncementPublishStatus[];
  priorities: AnnouncementPriority[];
  unread: boolean;
  urgent: boolean;
  archived: boolean;
};

export const EMPTY_ANNOUNCEMENT_FILTERS: AnnouncementInboxFilters = {
  ...EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  categories: [],
  statuses: [],
  priorities: [],
  unread: false,
  urgent: false,
  archived: false,
};

export type InboxStats = {
  unread: number;
  pending: number;
  resolved: number;
};
