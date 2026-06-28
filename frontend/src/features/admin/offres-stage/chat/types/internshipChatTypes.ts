import type { ChatAttachmentView } from '../../../../shared/contextual-chat/utils/chatAttachmentUtils';

export type BackendApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_DECLINED'
  | 'INTERNSHIP_STARTED'
  | 'INTERNSHIP_COMPLETED'
  | 'INQUIRY';

/** Libellés UI pour les filtres et badges */
export type ApplicationStatusLabel =
  | 'Not Applied'
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn'
  | 'Completed';

/** Aligné sur InternshipOffer.OfferType + types métier ESCA */
export type InternshipTypeLabel =
  | 'PFE'
  | 'PFA'
  | 'Summer Internship'
  | 'Observation Internship'
  | 'Part-Time Internship'
  | 'International Internship'
  | 'Alternance'
  | 'Internship'
  | 'Other';

export type ConversationPriority = 'Normal' | 'Important' | 'Urgent' | 'Critical';

export type ConversationTag =
  | 'Application Question'
  | 'Deadline Question'
  | 'Interview Question'
  | 'Document Request'
  | 'Offer Clarification'
  | 'Technical Issue'
  | 'General Inquiry';

export type PrimaryInboxFilter =
  | 'all'
  | 'unread'
  | 'waiting_admin'
  | 'waiting_student'
  | 'urgent'
  | 'resolved'
  | 'archived';

export type InternshipMessageDeliveryStatus = 'sent' | 'delivered' | 'read';

export type InternshipMessage = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  separatorBefore?: string;
  read?: boolean;
  deliveryStatus?: InternshipMessageDeliveryStatus;
  seenAt?: string;
  seenTime?: string;
  attachmentName?: string;
  attachments?: ChatAttachmentView[];
  messageType?: string;
  smartActionCode?: string;
  createdAt?: string;
  tags?: string[];
};

export type InternshipConversation = {
  id: string;
  conversationId: number;
  studentName: string;
  studentInitials: string;
  studentAvatarUrl?: string;
  offerTitle: string;
  offerUuid?: string;
  company: string;
  internshipType: InternshipTypeLabel;
  program: string;
  className: string;
  academicLevel: string;
  applicationStatus: ApplicationStatusLabel;
  backendApplicationStatus: BackendApplicationStatus | null;
  appliedDate: string;
  deadline: string;
  interviewDate: string;
  lastStatusChange: string;
  lastMessage: string;
  lastMessageIsOwn?: boolean;
  lastMessageAt?: string | null;
  timeLabel: string;
  unreadCount: number;
  priority: ConversationPriority;
  resolved: boolean;
  archived: boolean;
  waitingForAdmin: boolean;
  waitingForStudent: boolean;
  tags: ConversationTag[];
  messages: InternshipMessage[];
  studentEmail?: string;
  studentPhone?: string;
  studentProfileId?: number;
  studentUserId?: number;
  applicationUuid?: string;
  applicationId?: number;
  companyLogoUrl?: string;
};

export type InboxFilters = {
  primary: PrimaryInboxFilter;
  applicationStatuses: ApplicationStatusLabel[];
  internshipTypes: InternshipTypeLabel[];
  programs: string[];
  academicLevels: string[];
  classes: string[];
  priorities: ConversationPriority[];
  tags: ConversationTag[];
};

export const EMPTY_INBOX_FILTERS: InboxFilters = {
  primary: 'all',
  applicationStatuses: [],
  internshipTypes: [],
  programs: [],
  academicLevels: [],
  classes: [],
  priorities: [],
  tags: [],
};

export type InboxStats = {
  unread: number;
  waitingAdmin: number;
  waitingStudent: number;
  resolved: number;
};

export type FilterCounts = {
  programs: Record<string, number>;
  academicLevels: Record<string, number>;
  classes: Record<string, number>;
  applicationStatuses: Record<string, number>;
  internshipTypes: Record<string, number>;
};

export const APPLICATION_STATUS_LABELS: ApplicationStatusLabel[] = [
  'Not Applied',
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Accepted',
  'Rejected',
  'Withdrawn',
  'Completed',
];

export const INTERNSHIP_TYPE_LABELS: InternshipTypeLabel[] = [
  'PFE',
  'PFA',
  'Summer Internship',
  'Observation Internship',
  'Part-Time Internship',
  'International Internship',
  'Alternance',
];

export const ACADEMIC_LEVEL_LABELS = ['1A', '2A', '3A', '4A', '5A', 'Master'] as const;

export const CONVERSATION_PRIORITY_LABELS: ConversationPriority[] = [
  'Normal',
  'Important',
  'Urgent',
  'Critical',
];

export const CONVERSATION_TAG_LABELS: ConversationTag[] = [
  'Application Question',
  'Deadline Question',
  'Interview Question',
  'Document Request',
  'Offer Clarification',
  'Technical Issue',
  'General Inquiry',
];

export type PrimaryFilterCounts = Record<PrimaryInboxFilter, number>;

export const PRIMARY_FILTERS: PrimaryInboxFilter[] = [
  'all',
  'unread',
  'waiting_admin',
  'waiting_student',
  'urgent',
  'resolved',
  'archived',
];
