export type StudentHistoryModuleKey =
  | 'internshipOffers'
  | 'myApplications'
  | 'announcements'
  | 'documents'
  | 'srf'
  | 'careerTools'
  | 'chat';

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
  module: StudentHistoryModuleKey;
  eventType: StudentHistoryEventType;
  managementStatus: StudentHistoryManagementStatus;
  priority: StudentHistoryPriority;
  title: string;
  detail: string;
  timestamp: string;
}

/** @deprecated Use StudentHistoryModuleKey */
export type StudentHistoryModule = StudentHistoryModuleKey;
