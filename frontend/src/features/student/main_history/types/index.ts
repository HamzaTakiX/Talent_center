export type StudentHistoryModule =
  | 'Internship Offers'
  | 'My Applications'
  | 'Announcements'
  | 'Documents'
  | 'SRF (Finance)'
  | 'Career Tools'
  | 'Chat';

export type StudentHistoryEventType =
  | 'application'
  | 'offer'
  | 'announcement'
  | 'document'
  | 'payment'
  | 'tool'
  | 'message';

export type StudentHistoryManagementStatus =
  | 'submitted'
  | 'in_review'
  | 'accepted'
  | 'declined'
  | 'completed';

export type StudentHistoryPriority = 'high' | 'medium' | 'low';

export interface StudentHistoryStatItem {
  key: string;
  label: string;
  value: string;
  icon: 'activity' | 'users' | 'shield' | 'graduation' | 'briefcase' | 'file' | 'receipt' | 'message';
  colorClassName: string;
}

export interface StudentHistoryActionRow {
  id: string;
  module: StudentHistoryModule;
  eventType: StudentHistoryEventType;
  managementStatus: StudentHistoryManagementStatus;
  priority: StudentHistoryPriority;
  title: string;
  detail: string;
  timestamp: string;
}
