import type { WorkspaceDetail } from '../types';
import { workspaceStudentsMock } from './workspaceMock';

const defaultStickyNotes: WorkspaceDetail['stickyNotes'] = [
  {
    id: 'note-1',
    text: 'Verify API authentication logic',
    color: 'yellow',
    top: '8%',
    left: '4%',
  },
  {
    id: 'note-2',
    text: 'Schedule code review session',
    color: 'blue',
    top: '6%',
    left: '52%',
  },
  {
    id: 'note-3',
    text: 'Update database schema documentation',
    color: 'green',
    top: '38%',
    left: '8%',
  },
  {
    id: 'note-4',
    text: 'Test deployment pipeline',
    color: 'pink',
    top: '42%',
    left: '48%',
  },
  {
    id: 'note-5',
    text: 'Prepare presentation slides',
    color: 'purple',
    top: '68%',
    left: '28%',
  },
];

const defaultSharedFiles: WorkspaceDetail['sharedFiles'] = [
  {
    id: 'file-1',
    name: 'Project Architecture.pdf',
    meta: 'PDF • 2.4 MB',
    uploadedBy: 'Sarah Alami • 18/04/2026',
  },
  {
    id: 'file-2',
    name: 'Meeting Notes - Week 15.docx',
    meta: 'DOCX • 156 KB',
    uploadedBy: 'You • 17/04/2026',
  },
  {
    id: 'file-3',
    name: 'Code Review Checklist.xlsx',
    meta: 'XLSX • 89 KB',
    uploadedBy: 'You • 16/04/2026',
  },
];

const defaultRecentActivity: WorkspaceDetail['recentActivity'] = [
  { id: 'act-1', action: 'Added sticky note', timeAgo: '2 minutes ago' },
  { id: 'act-2', action: 'Uploaded document', timeAgo: '15 minutes ago' },
  { id: 'act-3', action: 'Updated board layout', timeAgo: '1 hour ago' },
];

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const getWorkspaceDetail = (studentId: string): WorkspaceDetail | undefined => {
  const student = workspaceStudentsMock.find((s) => s.id === studentId);
  if (!student) return undefined;

  const sharedFiles = defaultSharedFiles.map((file) =>
    file.id === 'file-1'
      ? { ...file, uploadedBy: `${student.name} • 18/04/2026` }
      : file
  );

  return {
    studentId: student.id,
    studentName: student.name,
    studentInitials: getInitials(student.name),
    stickyNotes: defaultStickyNotes,
    sharedFiles,
    recentActivity: defaultRecentActivity,
  };
};
