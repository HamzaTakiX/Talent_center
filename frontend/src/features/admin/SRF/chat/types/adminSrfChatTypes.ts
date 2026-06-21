export type AdminSrfChatMessage = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  topicTag?: string;
  separatorBefore?: string;
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

export type AdminSrfConversation = StudentAcademicFields & {
  id: string;
  studentName: string;
  studentInitials: string;
  statusLabel: string;
  financialSummary: AdminSrfFinancialSummary;
  obligations: AdminSrfFinancialObligation[];
  upcomingDeadline: { label: string };
  lastPreview: string;
  timeLabel: string;
  unreadCount: number;
  messages: AdminSrfChatMessage[];
};
