export interface DocumentPendingRow {
  documentType: string;
  student: string;
  date: string;
}

export const DOCUMENTS_PENDING_COUNT = 45;

export const documentsPendingValidationMockRows: DocumentPendingRow[] = [
  { documentType: 'Convention de stage', student: 'Youssef Benani', date: '2026-04-16' },
  { documentType: 'Documents financiers', student: 'Fatima Zahra', date: '2026-04-18' },
];
