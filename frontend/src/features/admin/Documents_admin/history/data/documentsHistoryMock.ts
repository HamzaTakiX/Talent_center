export type DocumentsTimelineStatus =
  | 'document_uploaded'
  | 'document_validated'
  | 'document_rejected'
  | 'correction_requested'
  | 'document_downloaded';

export interface DocumentsTimelineRow {
  id: string;
  status: DocumentsTimelineStatus;
  actorName: string;
  headline: string;
  fileRef: string;
  date: string;
  time: string;
  docType: 'convention' | 'attestation' | 'financial' | 'other';
  reviewState: 'pending' | 'action_required' | 'cleared';
}

export const documentsHistorySeed: DocumentsTimelineRow[] = [
  {
    id: 'dh1',
    status: 'document_uploaded',
    actorName: 'Student portal',
    headline: 'New upload • dual-signed convention Pack v3',
    fileRef: 'DOC-CONV-9821.pdf',
    date: '02/05/2026',
    time: '06:41',
    docType: 'convention',
    reviewState: 'pending',
  },
  {
    id: 'dh2',
    status: 'correction_requested',
    actorName: 'Compliance Officer',
    headline: 'Request minor correction — blurry annex',
    fileRef: 'DOC-CONV-9744_scan.jpg',
    date: '02/05/2026',
    time: '07:53',
    docType: 'convention',
    reviewState: 'action_required',
  },
  {
    id: 'dh3',
    status: 'document_validated',
    actorName: 'Registry admin',
    headline: 'Convention validated & sealed',
    fileRef: 'DOC-CONV-9744-fixed.pdf',
    date: '02/05/2026',
    time: '09:10',
    docType: 'convention',
    reviewState: 'cleared',
  },
  {
    id: 'dh4',
    status: 'document_rejected',
    actorName: 'Automated OCR',
    headline: 'Reject — mismatch on corporate legal name block',
    fileRef: 'DOC-FIN-MISALIGNED.tif',
    date: '02/05/2026',
    time: '09:52',
    docType: 'financial',
    reviewState: 'action_required',
  },
  {
    id: 'dh5',
    status: 'document_downloaded',
    actorName: 'Employer verifier',
    headline: 'Downloaded attestation archive for onboarding pack',
    fileRef: 'ATTEST-BUNDLE-APR.zip',
    date: '01/05/2026',
    time: '15:41',
    docType: 'attestation',
    reviewState: 'cleared',
  },
  {
    id: 'dh6',
    status: 'document_uploaded',
    actorName: 'Faculty Liaison',
    headline: 'Proof of insurance swapped after carrier change',
    fileRef: 'INS-PROOF-APR26.pdf',
    date: '30/04/2026',
    time: '12:06',
    docType: 'other',
    reviewState: 'pending',
  },
  {
    id: 'dh7',
    status: 'document_validated',
    actorName: 'Sr. Registrar',
    headline: 'Attestation bilingual footer approved manually',
    fileRef: 'ATTEST-ENG-FR-final.pdf',
    date: '28/04/2026',
    time: '18:58',
    docType: 'attestation',
    reviewState: 'cleared',
  },
];
