import type {
  StudentHistoryEventType,
  StudentHistoryManagementStatus,
  StudentHistoryPriority,
} from '../types';

export const STUDENT_HISTORY_MODULE_FILTER_OPTIONS = [
  'All Areas',
  'Internship Offers',
  'My Applications',
  'Announcements',
  'Documents',
  'SRF (Finance)',
  'Career Tools',
  'Chat',
] as const;

export const STUDENT_HISTORY_STATUS_FILTER_OPTIONS = [
  'All Statuses',
  'Submitted',
  'In review',
  'Accepted',
  'Declined',
  'Completed',
] as const;

/** Maps filter label → row.managementStatus */
export const STUDENT_HISTORY_STATUS_FILTER_MAP: Record<
  (typeof STUDENT_HISTORY_STATUS_FILTER_OPTIONS)[number],
  StudentHistoryManagementStatus | null
> = {
  'All Statuses': null,
  Submitted: 'submitted',
  'In review': 'in_review',
  Accepted: 'accepted',
  Declined: 'declined',
  Completed: 'completed',
};

export const STUDENT_HISTORY_PRIORITY_BADGE_CLASS: Record<StudentHistoryPriority, string> = {
  high: 'bg-[#fee9eb] text-[#b4232d]',
  medium: 'bg-[#f2ecff] text-[#6a32c9]',
  low: 'bg-[#eaf1ff] text-[#2458d3]',
};

export const STUDENT_HISTORY_EVENT_TYPE_LABEL: Record<StudentHistoryEventType, string> = {
  application: 'Application',
  offer: 'Offer',
  announcement: 'Announcement',
  document: 'Document',
  payment: 'Payment',
  tool: 'Career tool',
  message: 'Message',
};

export const STUDENT_HISTORY_EVENT_TYPE_BADGE_CLASS: Record<StudentHistoryEventType, string> = {
  application: 'bg-[#dcfce7] text-[#016630]',
  offer: 'bg-[#dbeafe] text-[#193cb8]',
  announcement: 'bg-[#fce7f3] text-[#9d174d]',
  document: 'bg-[#fef3c7] text-[#ca8a04]',
  payment: 'bg-[#ffedd4] text-[#9f2d00]',
  tool: 'bg-[#f3e8ff] text-[#6e11b0]',
  message: 'bg-[#dcfdf3] text-[#0f9f86]',
};

export const STUDENT_HISTORY_MANAGEMENT_STATUS_LABEL: Record<StudentHistoryManagementStatus, string> = {
  submitted: 'Submitted',
  in_review: 'In review',
  accepted: 'Accepted',
  declined: 'Declined',
  completed: 'Completed',
};

export const STUDENT_HISTORY_MANAGEMENT_STATUS_BADGE_CLASS: Record<
  StudentHistoryManagementStatus,
  string
> = {
  submitted: 'bg-[#dbeafe] text-[#193cb8]',
  in_review: 'bg-[#fff4db] text-[#9a5c00]',
  accepted: 'bg-[#e7f6ec] text-[#0f7b3a]',
  declined: 'bg-[#fee9eb] text-[#b4232d]',
  completed: 'bg-[#f3e8ff] text-[#6e11b0]',
};
