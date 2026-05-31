export type StickyNoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';

export interface WorkspaceStickyNote {
  id: string;
  text: string;
  color: StickyNoteColor;
  top: string;
  left: string;
}

export interface WorkspaceSharedFile {
  id: string;
  name: string;
  meta: string;
  uploadedBy: string;
}

export interface WorkspaceRecentActivity {
  id: string;
  action: string;
  timeAgo: string;
}

export interface WorkspaceDetail {
  studentId: string;
  studentName: string;
  studentInitials: string;
  stickyNotes: WorkspaceStickyNote[];
  sharedFiles: WorkspaceSharedFile[];
  recentActivity: WorkspaceRecentActivity[];
}
