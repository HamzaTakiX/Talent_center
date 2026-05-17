import type { ReportsHistoryRow, ReportsStatCard } from '../types';

export const reportsStats: ReportsStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '567', icon: 'total' },
  { key: 'submitted', label: 'Submitted', value: '345', icon: 'submitted' },
  { key: 'validated', label: 'Validated', value: '189', icon: 'validated' },
  { key: 'late', label: 'Late', value: '33', icon: 'late' },
];

export const reportsHistoryRows: ReportsHistoryRow[] = [
  {
    id: 'reph-1',
    module: 'Reports',
    actionType: 'create',
    title: 'Report submitted',
    actor: 'Youssef Benani',
    timestamp: '21/04/2026 15:20:00',
    details: 'Internship report was submitted by the student for review.',
  },
  {
    id: 'reph-2',
    module: 'Reports',
    actionType: 'validate',
    title: 'Report validated',
    actor: 'Dr. Hassan Lemrani',
    timestamp: '20/04/2026 17:30:00',
    details: 'The report was reviewed and approved by the encadrant.',
  },
  {
    id: 'reph-3',
    module: 'Reports',
    actionType: 'update',
    title: 'Late report flagged',
    actor: 'System',
    timestamp: '19/04/2026 09:00:00',
    details: 'Deadline passed without submission; the report was flagged as late.',
  },
];
