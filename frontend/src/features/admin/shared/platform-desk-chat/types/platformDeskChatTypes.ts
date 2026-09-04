import type { SupportMessage } from '../../admin-support-inbox/types/supportInboxTypes';

export type PlatformDeskEntityType =
  | 'student_admin_dm'
  | 'student_desk'
  | 'admin_desk'
  | 'encadrant_desk'
  | 'supervision_dm';

export type PlatformDeskViewerRole = 'admin' | 'student' | 'encadrant';

export type PrimaryDeskFilter = 'all' | 'archived';

export interface PrimaryFilterCounts {
  all: number;
  archived: number;
}

export interface PlatformDeskInboxFilters {
  primary: PrimaryDeskFilter;
  unread: boolean;
  urgent: boolean;
  programs: string[];
  academicLevels: string[];
  classes: string[];
}

export const EMPTY_PLATFORM_DESK_FILTERS: PlatformDeskInboxFilters = {
  primary: 'all',
  unread: false,
  urgent: false,
  programs: [],
  academicLevels: [],
  classes: [],
};

export interface PlatformDeskMessage extends SupportMessage {
  deliveryStatus?: 'sent' | 'delivered' | 'read';
  seenTime?: string;
  messageType?: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM' | 'EVENT' | 'MEETING_REQUEST';
  smartActionCode?: string;
  createdAt?: string;
  meetingRequest?: {
    requestId: string;
    mode: 'video' | 'voice';
    status: 'pending' | 'accepted' | 'declined';
    title?: string;
  };
}

export interface PlatformDeskConversation {
  id: string;
  conversationId: number;
  entityType: PlatformDeskEntityType;
  title: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  initials: string;
  program: string;
  academicLevel: string;
  className: string;
  roleLabel?: string;
  entityLabel?: string;
  workflowStatus?: string;
  contextKind?: string;
  urgency?: string;
  userId?: number | null;
  studentUserId?: number | null;
  studentProfileId?: number | null;
  encadrantProfileId?: number | null;
  specializationDomains?: string[];
  supervisedInternshipTypes?: string[];
  currentStudents?: number;
  maxStudents?: number;
  acceptingStudents?: boolean;
  isEncadrantActive?: boolean;
  lastMessage: string;
  timeLabel: string;
  lastMessageAt: string | null;
  unreadCount: number;
  urgent: boolean;
  resolved: boolean;
  archived: boolean;
  messages: PlatformDeskMessage[];
}

export interface PlatformDeskInboxStats {
  unread: number;
  pending: number;
  resolved: number;
  availableAdmins?: number;
}
