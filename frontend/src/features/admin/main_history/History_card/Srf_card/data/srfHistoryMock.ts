import type { SrfHistoryRow, SrfStatCard } from '../types';

export const srfStats: SrfStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '2,345', icon: 'total' },
  { key: 'validated', label: 'Validated', value: '1,456', icon: 'validated' },
  { key: 'pending', label: 'Pending', value: '678', icon: 'pending' },
  { key: 'created', label: 'Created', value: '211', icon: 'created' },
];

export const srfHistoryRows: SrfHistoryRow[] = [
  {
    id: 'srfh-1',
    module: 'SRF',
    actionType: 'validate',
    title: 'Payment receipt validated',
    actor: 'Admin Finance',
    timestamp: '21/04/2026 08:20:00',
    details: 'The payment receipt was verified and marked as validated in the system.',
  },
  {
    id: 'srfh-2',
    module: 'SRF',
    actionType: 'update',
    title: 'Payment status updated',
    actor: 'Admin Finance',
    timestamp: '20/04/2026 14:50:00',
    details: 'Payment status was updated following bank confirmation.',
  },
  {
    id: 'srfh-3',
    module: 'SRF',
    actionType: 'create',
    title: 'New payment record created',
    actor: 'System',
    timestamp: '19/04/2026 10:30:00',
    details: 'A new SRF payment record was created automatically after submission.',
  },
];
