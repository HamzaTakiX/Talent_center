import type {
  WorkspaceDiscussionMessage,
  WorkspaceDocumentItem,
  WorkspaceStickyNote,
  WorkspaceTabItem,
} from '../types';

export const workspaceTabs: WorkspaceTabItem[] = [
  { id: 'whiteboard', label: 'Tableau blanc' },
  { id: 'documents', label: 'Documents' },
  { id: 'notes', label: 'Notes' },
  { id: 'discussion', label: 'Discussion' },
];

export const workspaceActiveUsersCount = 2;

export const workspaceStickyNotes: WorkspaceStickyNote[] = [
  {
    id: 'note-1',
    text: 'Revoir la méthodologie du chapitre 3',
    color: 'yellow',
    positionClass: 'sm:left-4 sm:top-4 md:left-6 md:top-6',
  },
  {
    id: 'note-2',
    text: 'Ajouter plus de références récentes (2024-2026)',
    color: 'blue',
    positionClass: 'sm:left-4 sm:top-[7.25rem] md:left-[38%] md:top-8',
  },
  {
    id: 'note-3',
    text: 'Préparer les graphiques pour les résultats',
    color: 'green',
    positionClass: 'sm:left-4 sm:top-[14.5rem] md:left-8 md:top-36',
  },
];

export const workspaceCursorLabel = 'Dr. Bennani';

export const workspaceDocuments: WorkspaceDocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Chapter_2_Draft.pdf',
    author: 'Sarah Alami',
    date: '15/04/2026',
    size: '2.3 MB',
  },
  {
    id: 'doc-2',
    name: 'Research_References.docx',
    author: 'Dr. Ahmed Bennani',
    date: '14/04/2026',
    size: '850 KB',
  },
  {
    id: 'doc-3',
    name: 'Meeting_Notes_04-10.md',
    author: 'Sarah Alami',
    date: '10/04/2026',
    size: '45 KB',
  },
];

export const workspaceNotesPlaceholder = 'Commencez à écrire vos notes ici...';
export const workspaceNotesLastModified = 'Dernière modification il y a 2 minutes';

export const workspaceDiscussionMessages: WorkspaceDiscussionMessage[] = [
  {
    id: 'msg-1',
    authorInitials: 'AB',
    authorName: 'Dr. Ahmed Bennani',
    text: "N'oubliez pas d'ajouter les références que nous avons discutées dans le document partagé.",
    timeLabel: 'Il y a 1 heure',
    isOutgoing: false,
    avatarClass: 'bg-[#7c3aed]',
  },
  {
    id: 'msg-2',
    authorInitials: 'SA',
    authorName: 'Sarah Alami',
    text: "D'accord, je vais les ajouter aujourd'hui. J'ai aussi mis à jour le tableau blanc avec nos idées de ce matin.",
    timeLabel: 'Il y a 45 minutes',
    isOutgoing: true,
    avatarClass: 'bg-[#2563eb]',
  },
];

export const workspaceDiscussionInputPlaceholder = 'Écrivez votre message...';

export const workspaceMeetingStartLabel = 'Démarrer une réunion';

export const workspaceMeeting = {
  title: 'Réunion en cours',
  subtitle: 'Vous êtes en réunion avec Dr. Ahmed Bennani',
  liveLabel: 'LIVE',
  participantCountLabel: '2 participants',
  durationLabel: '12:34',
  participants: [
    {
      id: 'self',
      initials: 'SA',
      label: 'Vous',
      gradientClass: 'bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]',
    },
    {
      id: 'supervisor',
      initials: 'AB',
      label: 'Dr. Ahmed Bennani',
      gradientClass: 'bg-gradient-to-br from-[#8b5cf6] to-[#ec4899]',
    },
  ],
} as const;
