export type DocumentRequestStatus = 'Validated' | 'Pending' | 'Rejected';

export interface DocumentRequestRow {
  id: string;
  documentType: string;
  studentName: string;
  /** Classe ou niveau (ex. Master 1) — affichée sur certaines vues liste. */
  studentClass?: string;
  submissionDate: string;
  status: DocumentRequestStatus;
}

export interface DocumentRequestStat {
  label: string;
  labelKey?: string;
  statKey?: 'total' | 'pending' | 'validated' | 'rejected';
  value: string;
  icon: 'FileText' | 'Clock' | 'CheckCircle' | 'XCircle';
}
