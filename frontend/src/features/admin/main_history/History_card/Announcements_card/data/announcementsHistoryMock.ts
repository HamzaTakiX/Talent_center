import type { AnnouncementsHistoryRow, AnnouncementsStatCard } from '../types';

export const announcementsStats: AnnouncementsStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '456', icon: 'total' },
  { key: 'published', label: 'Published', value: '234', icon: 'published' },
  { key: 'edited', label: 'Edited', value: '156', icon: 'edited' },
  { key: 'deleted', label: 'Deleted', value: '66', icon: 'deleted' },
];

export const announcementsHistoryRows: AnnouncementsHistoryRow[] = [
  {
    id: 'annh-1',
    module: 'Announcements',
    actionType: 'create',
    title: 'Announcement published',
    actor: 'Admin Communication',
    timestamp: '21/04/2026 07:30:00',
    details: 'A new announcement was published and visible to targeted students.',
  },
  {
    id: 'annh-2',
    module: 'Announcements',
    actionType: 'update',
    title: 'Announcement edited',
    actor: 'Admin Communication',
    timestamp: '20/04/2026 14:15:00',
    details: 'Announcement content and schedule were updated after review.',
  },
  {
    id: 'annh-3',
    module: 'Announcements',
    actionType: 'delete',
    title: 'Announcement deleted',
    actor: 'Admin Communication',
    timestamp: '19/04/2026 10:00:00',
    details: 'The announcement was removed from the platform.',
  },
];
