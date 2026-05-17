import type { HistoryActionType, HistoryModule } from '../types';

export const HISTORY_MODULE_FILTER_ALL = 'all' as const;

export const HISTORY_MODULE_FILTERS: ReadonlyArray<{
  value: typeof HISTORY_MODULE_FILTER_ALL | HistoryModule;
  labelKey: string;
}> = [
  { value: HISTORY_MODULE_FILTER_ALL, labelKey: 'all' },
  { value: 'Internship Offers', labelKey: 'internshipOffers' },
  { value: 'Documents', labelKey: 'documents' },
  { value: 'Students', labelKey: 'students' },
  { value: 'Announcements', labelKey: 'announcements' },
  { value: 'SRF', labelKey: 'srf' },
  { value: 'Encadrants', labelKey: 'encadrants' },
  { value: 'Reports', labelKey: 'reports' },
  { value: 'Chat', labelKey: 'chat' },
];

export const HISTORY_ACTION_FILTER_ALL = 'all' as const;

export const HISTORY_ACTION_FILTERS: ReadonlyArray<{
  value: typeof HISTORY_ACTION_FILTER_ALL | HistoryActionType;
  labelKey: string;
}> = [
  { value: HISTORY_ACTION_FILTER_ALL, labelKey: 'all' },
  { value: 'create', labelKey: 'create' },
  { value: 'update', labelKey: 'update' },
  { value: 'validate', labelKey: 'validate' },
  { value: 'archive', labelKey: 'archive' },
  { value: 'review', labelKey: 'review' },
  { value: 'assign', labelKey: 'assign' },
  { value: 'submit', labelKey: 'submit' },
];
