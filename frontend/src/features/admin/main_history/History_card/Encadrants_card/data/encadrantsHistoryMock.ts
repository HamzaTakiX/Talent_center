import type { EncadrantsHistoryRow, EncadrantsStatCard } from '../types';

export const encadrantsStats: EncadrantsStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '1,789', icon: 'total' },
  { key: 'assignments', label: 'Assignments', value: '456', icon: 'assignments' },
  { key: 'validations', label: 'Validations', value: '892', icon: 'validations' },
  { key: 'meetings', label: 'Meetings', value: '234', icon: 'meetings' },
];

export const encadrantsRows: EncadrantsHistoryRow[] = [
  {
    id: 'eh-1',
    module: 'Encadrants',
    actionType: 'update',
    title: 'Encadrant assigned to student',
    actor: 'Admin Stage',
    timestamp: '21/04/2026 08:45:00',
    details: 'Assigned supervising encadrant to a student internship track.',
  },
  {
    id: 'eh-2',
    module: 'Encadrants',
    actionType: 'validate',
    title: 'Report validated by encadrant',
    actor: 'Dr. Hassan Lemrani',
    timestamp: '20/04/2026 17:00:00',
    details: 'Validated a student report after feedback cycle completion.',
  },
  {
    id: 'eh-3',
    module: 'Encadrants',
    actionType: 'create',
    title: 'Meeting created by encadrant',
    actor: 'Dr. Hassan Lemrani',
    timestamp: '20/04/2026 09:30:00',
    details: 'Created a supervision meeting linked to the student follow-up plan.',
  },
];
