export type DocumentCategory =
  | 'Convention'
  | 'Attestation'
  | 'Certificate'
  | 'Insurance'
  | 'Transcript'
  | 'Administrative';

export type DocumentRequestStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Validated'
  | 'Rejected'
  | 'Correction Required'
  | 'Pending';

export type DocumentPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type DeliveryMethod = 'Digital' | 'Pickup' | 'Mail' | 'Signature';

import type { ChatAttachmentView } from '../../../../shared/contextual-chat/utils/chatAttachmentUtils';

export type DocumentMessage = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  separatorBefore?: string;
  read?: boolean;
  messageType?: string;
  attachmentName?: string;
  attachments?: ChatAttachmentView[];
  tags?: string[];
  entityRefs?: import('../../contextual-chat/types/chatEntityTypes').ChatEntityReference[];
};

import type { StudentAcademicFields } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

export type PrimaryDocumentFilter = 'all' | 'archived';

export type DocumentConversation = StudentAcademicFields & {
  id: string;
  conversationId: number;
  studentUserId: number | null;
  studentName: string;
  studentInitials: string;
  studentEmail?: string;
  studentAvatarUrl?: string;
  serviceId: string;
  serviceCode: string;
  iconKey: string;
  colorTheme: string;
  documentTitle: string;
  documentCategory: DocumentCategory;
  reference: string;
  requestStatus: DocumentRequestStatus;
  priority: DocumentPriority;
  submittedDate: string;
  slaDeadline: string;
  deliveryMethod: DeliveryMethod;
  serviceName: string;
  lastMessage: string;
  timeLabel: string;
  lastMessageAt?: string | null;
  unreadCount: number;
  urgent: boolean;
  resolved: boolean;
  archived: boolean;
  messages: DocumentMessage[];
  requestNotes?: string;
  workflowStep?: string;
};

import {
  EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  type StudentAcademicChatFilters,
} from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

export type DocumentInboxFilters = StudentAcademicChatFilters & {
  primary: PrimaryDocumentFilter;
  categories: DocumentCategory[];
  statuses: DocumentRequestStatus[];
  priorities: DocumentPriority[];
  unread: boolean;
  urgent: boolean;
};

export const EMPTY_DOCUMENT_FILTERS: DocumentInboxFilters = {
  ...EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  primary: 'all',
  categories: [],
  statuses: [],
  priorities: [],
  unread: false,
  urgent: false,
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
