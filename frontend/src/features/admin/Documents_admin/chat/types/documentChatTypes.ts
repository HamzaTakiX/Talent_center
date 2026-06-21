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

export type DocumentMessage = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  separatorBefore?: string;
  read?: boolean;
  attachmentName?: string;
};

import type { StudentAcademicFields } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

export type DocumentConversation = StudentAcademicFields & {
  id: string;
  studentName: string;
  studentInitials: string;
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
  unreadCount: number;
  urgent: boolean;
  resolved: boolean;
  archived: boolean;
  messages: DocumentMessage[];
  studentEmail?: string;
  requestNotes?: string;
  workflowStep?: string;
};

import {
  EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  type StudentAcademicChatFilters,
} from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

export type DocumentInboxFilters = StudentAcademicChatFilters & {
  categories: DocumentCategory[];
  statuses: DocumentRequestStatus[];
  priorities: DocumentPriority[];
  unread: boolean;
  urgent: boolean;
  archived: boolean;
};

export const EMPTY_DOCUMENT_FILTERS: DocumentInboxFilters = {
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
