export type AdminSrfChatMessage = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  topicTag?: string;
  separatorBefore?: string;
  read?: boolean;
  messageType?: string;
};

export type AdminSrfFinancialObligation = {
  id: string;
  title: string;
  status: 'paid' | 'unpaid';
  detail: string;
};

export type AdminSrfFinancialSummary = {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
};

import type { StudentAcademicFields } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

export type PrimarySrfFilter = 'all' | 'archived';

export type SrfInboxFilters = import('../../../shared/chat-filters/studentAcademicChatFilterTypes').StudentAcademicChatFilters & {
  primary: PrimarySrfFilter;
  unread: boolean;
};

export const EMPTY_SRF_FILTERS: SrfInboxFilters = {
  primary: 'all',
  programs: [],
  academicLevels: [],
  classes: [],
  unread: false,
};

export type PrimaryFilterCounts = {
  all: number;
  archived: number;
};

export type InboxStats = {
  unread: number;
  pending: number;
  resolved: number;
};

export type AdminSrfConversation = StudentAcademicFields & {
  id: string;
  conversationId: number;
  studentUserId: number | null;
  studentName: string;
  studentInitials: string;
  studentEmail?: string;
  studentAvatarUrl?: string;
  statusLabel: string;
  financialSummary: AdminSrfFinancialSummary;
  obligations: AdminSrfFinancialObligation[];
  upcomingDeadline: { label: string };
  lastPreview: string;
  lastMessageIsOwn: boolean;
  timeLabel: string;
  lastMessageAt?: string | null;
  unreadCount: number;
  resolved: boolean;
  archived: boolean;
  messages: AdminSrfChatMessage[];
};
