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
  deliveryStatus?: 'sent' | 'delivered' | 'read';
  seenAt?: string;
  seenTime?: string;
  attachmentName?: string;
};

import type { StudentAcademicFields } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

export type PrimaryAnnouncementFilter = 'all' | 'archived';

export type PrimaryFilterCounts = {
  all: number;
  archived: number;
};

export type AnnouncementConversation = StudentAcademicFields & {
  id: string;
  conversationId?: number;
  studentUserId?: number | null;
  studentName: string;
  studentInitials: string;
  studentAvatarUrl?: string;
  announcementTitle: string;
  announcementUuid?: string;
  announcementTypeName?: string;
  coverImageUrl?: string;
  companyName?: string;
  category: AnnouncementCategory;
  publishStatus: AnnouncementPublishStatus;
  priority: AnnouncementPriority;
  publishDate: string;
  expiryDate: string;
  audience: string;
  lastMessage: string;
  timeLabel: string;
  lastMessageAt?: string | null;
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
  primary: PrimaryAnnouncementFilter;
  categories: AnnouncementCategory[];
  statuses: AnnouncementPublishStatus[];
  priorities: AnnouncementPriority[];
  unread: boolean;
  urgent: boolean;
};

export const EMPTY_ANNOUNCEMENT_FILTERS: AnnouncementInboxFilters = {
  ...EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  primary: 'all',
  categories: [],
  statuses: [],
  priorities: [],
  unread: false,
  urgent: false,
};

export type InboxStats = {
  unread: number;
  pending: number;
  resolved: number;
};
