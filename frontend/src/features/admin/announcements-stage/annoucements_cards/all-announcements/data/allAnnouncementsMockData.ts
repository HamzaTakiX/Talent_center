import { AnnouncementRow, AnnouncementType } from '../../../types';

export type AllAnnouncementsTypeFilter = 'all' | AnnouncementType;

export const ALL_ANNOUNCEMENTS_COUNT = 6;

/** Lignes alignées sur l’export Figma du tableau « All Announcements ». */
export const allAnnouncementsRows: AnnouncementRow[] = [
  {
    id: '1',
    title: 'Journée Portes Ouvertes - Entreprises Partenaires',
    type: 'Event',
    targetAudience: 'All Students',
    date: '10/05/2026',
  },
  {
    id: '2',
    title: 'Rappel: Entretiens de Stage - Semaine prochaine',
    type: 'Interview',
    targetAudience: 'Final Year',
    date: '20/04/2026',
  },
  {
    id: '3',
    title: 'Nouvelle procédure de validation des rapports',
    type: 'Info',
    targetAudience: 'All Students',
    date: '15/04/2026',
  },
  {
    id: '4',
    title: 'Conférence: Intelligence Artificielle et Éthique',
    type: 'Event',
    targetAudience: 'Computer Science',
    date: '05/05/2026',
  },
  {
    id: '5',
    title: 'Workshop CV et Lettre de Motivation',
    type: 'Event',
    targetAudience: 'All Students',
    date: '25/04/2026',
  },
  {
    id: '6',
    title: 'Deadline Dépôt Rapport de Stage',
    type: 'Info',
    targetAudience: 'Final Year',
    date: '01/06/2026',
  },
];
