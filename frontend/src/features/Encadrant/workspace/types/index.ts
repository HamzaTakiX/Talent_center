export interface WorkspaceStudent {
  id: string;
  name: string;
  level: string;
  activeSessions: number;
  lastActivity: string;
}

export type {
  StickyNoteColor,
  WorkspaceDetail,
  WorkspaceRecentActivity,
  WorkspaceSharedFile,
  WorkspaceStickyNote,
} from './workspaceDetail';
