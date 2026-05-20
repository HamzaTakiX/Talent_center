export type WorkspaceTabId = 'whiteboard' | 'documents' | 'notes' | 'discussion';

export interface WorkspaceTabItem {
  id: WorkspaceTabId;
  label: string;
}

export interface WorkspaceStickyNote {
  id: string;
  text: string;
  color: 'yellow' | 'blue' | 'green';
  positionClass: string;
}

export interface WorkspaceDocumentItem {
  id: string;
  name: string;
  author: string;
  date: string;
  size: string;
}

export interface WorkspaceDiscussionMessage {
  id: string;
  authorInitials: string;
  authorName: string;
  text: string;
  timeLabel: string;
  isOutgoing: boolean;
  avatarClass: string;
}

export interface WorkspaceMeetingParticipant {
  id: string;
  initials: string;
  label: string;
  gradientClass: string;
}

export interface WorkspaceMeetingData {
  title: string;
  subtitle: string;
  liveLabel: string;
  participantCountLabel: string;
  durationLabel: string;
  participants: WorkspaceMeetingParticipant[];
}
