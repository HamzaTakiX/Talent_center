import { DocumentRequestRow, DocumentRequestStat } from '../types';

export const documentRequestsStats: DocumentRequestStat[] = [
  { label: 'Total Documents', labelKey: 'documents.total', statKey: 'total', value: '892', icon: 'FileText' },
  { label: 'Pending', labelKey: 'documents.pending', statKey: 'pending', value: '45', icon: 'Clock' },
  { label: 'Validated', labelKey: 'documents.validated', statKey: 'validated', value: '789', icon: 'CheckCircle' },
  { label: 'Rejected', labelKey: 'documents.rejected', statKey: 'rejected', value: '58', icon: 'XCircle' },
];

export const documentRequestsMockData: DocumentRequestRow[] = [
  {
    id: '1',
    documentType: 'Attestation de scolarité',
    studentName: 'Sarah Alami',
    studentClass: 'Master 1',
    submissionDate: '15/04/2026',
    status: 'Validated',
  },
  {
    id: '2',
    documentType: 'Convention de stage',
    studentName: 'Youssef Benani',
    studentClass: 'Master 2',
    submissionDate: '16/04/2026',
    status: 'Pending',
  },
  {
    id: '3',
    documentType: 'Relevé de notes',
    studentName: 'Amina Khalil',
    studentClass: 'Master 1',
    submissionDate: '14/04/2026',
    status: 'Validated',
  },
  {
    id: '4',
    documentType: 'Attestation de réussite',
    studentName: 'Mohamed Idrissi',
    studentClass: 'Master 2',
    submissionDate: '13/04/2026',
    status: 'Rejected',
  },
  {
    id: '5',
    documentType: 'Documents financiers',
    studentName: 'Fatima Zahra',
    studentClass: 'Master 1',
    submissionDate: '17/04/2026',
    status: 'Pending',
  },
  {
    id: '6',
    documentType: 'Justificatifs administratifs',
    studentName: 'Omar Benjelloun',
    studentClass: 'Master 2',
    submissionDate: '12/04/2026',
    status: 'Validated',
  },
  {
    id: '7',
    documentType: 'Autorisations',
    studentName: 'Leila Mansouri',
    studentClass: 'Master 1',
    submissionDate: '16/04/2026',
    status: 'Pending',
  },
];
