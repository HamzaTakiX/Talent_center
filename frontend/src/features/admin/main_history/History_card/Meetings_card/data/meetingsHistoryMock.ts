import type { MeetingsHistoryRow, MeetingsStatCard } from '../types';

export const meetingsStats: MeetingsStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '234', icon: 'total' },
  { key: 'scheduled', label: 'Scheduled', value: '145', icon: 'scheduled' },
  { key: 'completed', label: 'Completed', value: '67', icon: 'completed' },
  { key: 'canceled', label: 'Canceled', value: '22', icon: 'canceled' },
];

export const meetingsHistoryRows: MeetingsHistoryRow[] = [
  {
    id: 'meeth-1',
    module: 'Meetings',
    actionType: 'create',
    title: 'Meeting scheduled',
    actor: 'Dr. Hassan Lemrani',
    timestamp: '21/04/2026 08:00:00',
    details: 'A new supervision meeting was scheduled with the student.',
  },
  {
    id: 'meeth-2',
    module: 'Meetings',
    actionType: 'update',
    title: 'Meeting completed',
    actor: 'Sarah Alami',
    timestamp: '20/04/2026 15:30:00',
    details: 'The meeting was marked as completed after it took place.',
  },
  {
    id: 'meeth-3',
    module: 'Meetings',
    actionType: 'delete',
    title: 'Meeting canceled',
    actor: 'Admin Stage',
    timestamp: '19/04/2026 10:15:00',
    details: 'The meeting was canceled and participants were notified.',
  },
];
