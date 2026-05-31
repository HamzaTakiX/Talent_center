import type { CollaboratorStatus } from '../../types';

export interface WhiteboardCollaborator {
  id: string;
  nameKey: string;
  initials: string;
  status: CollaboratorStatus;
  isActive: boolean;
  color: string;
}

export interface WhiteboardVersion {
  id: string;
  labelKey: string;
  authorKey: string;
  createdAt: string;
  isCurrent?: boolean;
}

export const WHITEBOARD_STORAGE_KEY = 'esca-student-workspace-whiteboard-v1';

export const whiteboardBoardNameKey = 'student.encadrant.workspace.whiteboardPage.boardName';

export const whiteboardCollaborators: WhiteboardCollaborator[] = [
  {
    id: '1',
    nameKey: 'student.encadrant.workspace.platform.people.student',
    initials: 'SA',
    status: 'online',
    isActive: true,
    color: '#3b82f6',
  },
  {
    id: '2',
    nameKey: 'student.encadrant.workspace.platform.people.supervisor',
    initials: 'AB',
    status: 'reviewing',
    isActive: true,
    color: '#8b5cf6',
  },
  {
    id: '3',
    nameKey: 'student.encadrant.workspace.platform.people.peer',
    initials: 'YK',
    status: 'offline',
    isActive: false,
    color: '#64748b',
  },
];

export const whiteboardVersions: WhiteboardVersion[] = [
  {
    id: 'v4',
    labelKey: 'student.encadrant.workspace.whiteboardPage.versions.current',
    authorKey: 'student.encadrant.workspace.platform.people.student',
    createdAt: '2026-05-31T14:20:00',
    isCurrent: true,
  },
  {
    id: 'v3',
    labelKey: 'student.encadrant.workspace.whiteboardPage.versions.v3',
    authorKey: 'student.encadrant.workspace.platform.people.supervisor',
    createdAt: '2026-05-30T09:15:00',
  },
  {
    id: 'v2',
    labelKey: 'student.encadrant.workspace.whiteboardPage.versions.v2',
    authorKey: 'student.encadrant.workspace.platform.people.student',
    createdAt: '2026-05-28T16:40:00',
  },
  {
    id: 'v1',
    labelKey: 'student.encadrant.workspace.whiteboardPage.versions.v1',
    authorKey: 'student.encadrant.workspace.platform.people.student',
    createdAt: '2026-05-25T11:00:00',
  },
];
