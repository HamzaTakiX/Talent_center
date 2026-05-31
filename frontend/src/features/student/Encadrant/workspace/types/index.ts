export type WorkspaceTabId =
  | 'documents'
  | 'notes'
  | 'discussions'
  | 'tasks'
  | 'activity';

export type CollaboratorStatus = 'online' | 'offline' | 'in_meeting' | 'reviewing';

export type DocumentCategory = 'report' | 'research' | 'internship' | 'meeting' | 'shared';

export type FeedbackStatus = 'pending' | 'resolved' | 'in_review';

export type ActivityType =
  | 'upload'
  | 'comment'
  | 'feedback'
  | 'meeting'
  | 'task'
  | 'report';

export interface WorkspaceKpi {
  id: string;
  value: string;
  trend: number;
}

export interface WorkspaceCollaborator {
  id: string;
  nameKey: string;
  roleKey: string;
  initials: string;
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

export interface WorkspaceDocument {
  id: string;
  nameKey: string;
  category: DocumentCategory;
  authorKey: string;
  date: string;
  size: string;
  version: string;
}

export interface WorkspaceNote {
  id: string;
  titleKey: string;
  excerptKey: string;
  tags: string[];
  pinned: boolean;
  updatedAt: string;
}

export interface WorkspaceDiscussionThread {
  id: string;
  titleKey: string;
  type: 'supervisor' | 'project' | 'feedback' | 'review';
  lastMessageKey: string;
  replies: number;
  timeKey: string;
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

export interface WorkspaceKnowledgeItem {
  id: string;
  titleKey: string;
  type: 'link' | 'reference' | 'methodology' | 'document';
  url?: string;
}

export interface WorkspaceMeetingItem {
  id: string;
  titleKey: string;
  date: string;
  time: string;
  status: 'upcoming' | 'past';
  hasNotes: boolean;
  hasRecording: boolean;
}

export interface WorkspaceProgressMetric {
  id: string;
  labelKey: string;
  progress: number;
}

export interface WorkspaceNotification {
  id: string;
  messageKey: string;
  timeKey: string;
}

export interface WorkspacePlatformTask {
  id: string;
  titleKey: string;
  status: 'todo' | 'in_progress' | 'done';
  dueAt: string;
  fromSupervisor: boolean;
}
