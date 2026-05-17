import type { ApplicationsHistoryRow, ApplicationsStatCard } from '../types';

export const applicationsStats: ApplicationsStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '892', icon: 'total' },
  { key: 'submitted', label: 'Submitted', value: '456', icon: 'submitted' },
  { key: 'accepted', label: 'Accepted', value: '234', icon: 'accepted' },
  { key: 'rejected', label: 'Rejected', value: '89', icon: 'rejected' },
];

export const applicationsHistoryRows: ApplicationsHistoryRow[] = [
  {
    id: 'apph-1',
    module: 'Applications',
    actionType: 'create',
    title: 'Student applied to internship',
    actor: 'Sarah Alami',
    timestamp: '21/04/2026 11:30:00',
    details: 'New internship application submitted with uploaded CV and cover letter.',
  },
  {
    id: 'apph-2',
    module: 'Applications',
    actionType: 'update',
    title: 'Application accepted',
    actor: 'Admin Stage',
    timestamp: '20/04/2026 15:45:00',
    details: 'Application status changed to accepted after review.',
  },
  {
    id: 'apph-3',
    module: 'Applications',
    actionType: 'update',
    title: 'Application rejected',
    actor: 'Admin Stage',
    timestamp: '19/04/2026 10:20:00',
    details: 'Application declined with feedback communicated to the student.',
  },
];
