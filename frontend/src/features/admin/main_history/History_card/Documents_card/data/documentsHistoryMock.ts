import type { DocumentsHistoryRow, DocumentsStatCard } from '../types';

export const documentsStats: DocumentsStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '3,567', icon: 'total' },
  { key: 'uploaded', label: 'Uploaded', value: '1,892', icon: 'uploaded' },
  { key: 'validated', label: 'Validated', value: '1,234', icon: 'validated' },
  { key: 'rejected', label: 'Rejected', value: '441', icon: 'rejected' },
];

export const documentsHistoryRows: DocumentsHistoryRow[] = [
  {
    id: 'doch-1',
    module: 'Documents',
    actionType: 'validate',
    title: 'Document validated',
    actor: 'Admin Documents',
    timestamp: '21/04/2026 08:45:00',
    details: 'The submitted document was reviewed and marked as validated.',
  },
  {
    id: 'doch-2',
    module: 'Documents',
    actionType: 'create',
    title: 'Document uploaded',
    actor: 'Sarah Alami',
    timestamp: '20/04/2026 11:20:00',
    details: 'A new document was uploaded and is pending validation.',
  },
  {
    id: 'doch-3',
    module: 'Documents',
    actionType: 'update',
    title: 'Document rejected',
    actor: 'Admin Documents',
    timestamp: '19/04/2026 16:05:00',
    details: 'The document was rejected with comments sent to the student.',
  },
];
