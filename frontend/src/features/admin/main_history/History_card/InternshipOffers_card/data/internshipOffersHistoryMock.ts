import type { InternshipOffersHistoryRow, InternshipOffersStatCard } from '../types';

export const internshipOffersStats: InternshipOffersStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '1,234', icon: 'total' },
  { key: 'created', label: 'Created', value: '567', icon: 'create' },
  { key: 'updated', label: 'Updated', value: '456', icon: 'update' },
  { key: 'closed', label: 'Closed', value: '211', icon: 'delete' },
];

export const internshipOffersRows: InternshipOffersHistoryRow[] = [
  {
    id: 'ioh-1',
    module: 'Internship Offers',
    actionType: 'create',
    title: 'New offer published',
    actor: 'Admin Stage',
    timestamp: '21/04/2026 09:15:00',
    details: 'Published a new internship offer with updated role requirements.',
  },
  {
    id: 'ioh-2',
    module: 'Internship Offers',
    actionType: 'update',
    title: 'Offer updated',
    actor: 'Admin Stage',
    timestamp: '20/04/2026 14:20:00',
    details: 'Updated internship offer details and submission deadline.',
  },
  {
    id: 'ioh-3',
    module: 'Internship Offers',
    actionType: 'delete',
    title: 'Offer closed',
    actor: 'Admin Stage',
    timestamp: '19/04/2026 16:00:00',
    details: 'Closed offer after the recruitment window ended.',
  },
];
