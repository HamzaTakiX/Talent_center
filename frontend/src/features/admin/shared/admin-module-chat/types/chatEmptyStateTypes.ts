export type ChatEmptyModuleType =
  | 'internship'
  | 'documents'
  | 'meetings'
  | 'announcements'
  | 'student-support'
  | 'general';

export interface ChatEmptyStateStats {
  unread?: number;
  pending?: number;
  resolved?: number;
  labels?: {
    unread?: string;
    pending?: string;
    resolved?: string;
  };
}

export interface ChatEmptyStateProps {
  title: string;
  description: string;
  moduleType: ChatEmptyModuleType;
  stats?: ChatEmptyStateStats;
  statsLoading?: boolean;
  className?: string;
}
