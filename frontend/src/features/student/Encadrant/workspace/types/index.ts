export type WorkspaceTabId =
  | 'documents'
  | 'notes'
  | 'activity';

export type CollaboratorStatus = 'online' | 'offline' | 'in_meeting' | 'reviewing';

export type DocumentCategory = 'report' | 'research' | 'internship' | 'meeting' | 'shared';

export type FeedbackStatus = 'pending' | 'resolved' | 'in_review';

export type {
  WorkspaceDocument,
  WorkspaceDocumentReview,
} from '../../../../shared/workspace-documents';

export type ActivityType =
  | 'upload'
  | 'comment'
  | 'feedback'
  | 'meeting'
  | 'task'
  | 'report';

export type WorkspaceKpiId = 'boards' | 'documents' | 'notes' | 'activity';

export const WORKSPACE_KPI_IDS: WorkspaceKpiId[] = ['boards', 'documents', 'notes', 'activity'];

export interface WorkspaceKpiHint {
  count?: number;
  saved?: number;
  draft?: number;
}

export interface WorkspaceKpi {
  id: WorkspaceKpiId;
  value: string;
  hint: WorkspaceKpiHint;
  /** Share / rate for the donut, derived from page data. Omit when not meaningful. */
  ratio?: number;
}

export interface WorkspaceCollaborator {
  id: string;
  nameKey: string;
  roleKey: string;
  initials: string;
  avatarUrl: string;
  status: CollaboratorStatus;
  isActive: boolean;
}

export interface WorkspaceStickyNote {
  id: string;
  textKey: string;
  color: 'yellow' | 'blue' | 'green' | 'purple';
  positionClass: string;
  editedByKey: string;
}

export interface WorkspaceNote {
  id: string;
  titleKey: string;
  excerptKey: string;
  tags: string[];
  pinned: boolean;
  updatedAt: string;
  /** Note rédigée dans l'éditeur : `titleKey` / `excerptKey` contiennent du texte brut. */
  isUserCreated?: boolean;
}

export interface WorkspaceActivityItem {
  id: string;
  type: ActivityType;
  messageKey: string;
  timeKey: string;
  actorKey: string;
}

export interface WorkspaceFeedbackItem {
  id: string;
  commentKey: string;
  date: string;
  status: FeedbackStatus;
  documentKey: string;
}

export interface WorkspaceMeetingItem {
  id: string;
  titleKey: string;
  date: string;
  time: string;
  startAt?: string;
  status: 'upcoming' | 'past';
  hasNotes: boolean;
  hasRecording: boolean;
}

export interface WorkspaceNotification {
  id: string;
  messageKey: string;
  timeKey: string;
}
