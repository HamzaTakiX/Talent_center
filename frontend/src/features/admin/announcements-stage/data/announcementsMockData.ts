import { AnnouncementRow, AnnouncementStat } from '../types';

export const announcementsStats: AnnouncementStat[] = [
  {
    label: 'Total Announcements',
    labelKey: 'admin.kpi.announcements.total',
    statKey: 'total',
    value: '156',
    icon: 'Bell',
  },
  {
    label: 'Active Announcements',
    labelKey: 'admin.kpi.announcements.active',
    statKey: 'active',
    value: '34',
    icon: 'Megaphone',
  },
  {
    label: 'Engagement Rate',
    labelKey: 'admin.kpi.announcements.engagementRate',
    value: '78%',
    icon: 'TrendingUp',
  },
  {
    label: 'Avg Reach',
    labelKey: 'admin.kpi.announcements.avgReach',
    value: '892',
    icon: 'Users',
  },
];

/** Données alignées sur l'export Figma (4 lignes). */
export const announcementsMockData: AnnouncementRow[] = [
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
];
