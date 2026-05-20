/** Backend queue / filter mapping for SRF sub-pages. */
export type SrfSubpageId =
  | 'paid-students'
  | 'unpaid-students'
  | 'partially-paid'
  | 'pending-validation'
  | 'late-payments'
  | 'blocked-students'
  | 'exempted-students';

export interface SrfSubpageConfig {
  queue?: string;
  financialStatus?: string;
  kpiKey: string;
  emptyTitleKey: string;
  emptyDescriptionKey: string;
}

export const SRF_SUBPAGE_CONFIG: Record<SrfSubpageId, SrfSubpageConfig> = {
  'paid-students': {
    queue: 'paid',
    kpiKey: 'paid',
    emptyTitleKey: 'admin.empty.srfPaidStudents',
    emptyDescriptionKey: 'admin.empty.srfPaidStudentsDesc',
  },
  'unpaid-students': {
    queue: 'unpaid',
    kpiKey: 'unpaid',
    emptyTitleKey: 'admin.empty.srfUnpaidStudents',
    emptyDescriptionKey: 'admin.empty.srfUnpaidStudentsDesc',
  },
  'partially-paid': {
    queue: 'partial',
    kpiKey: 'partial',
    emptyTitleKey: 'admin.empty.srfPartialStudents',
    emptyDescriptionKey: 'admin.empty.srfPartialStudentsDesc',
  },
  'pending-validation': {
    queue: 'pending_validation',
    kpiKey: 'pending_validation',
    emptyTitleKey: 'admin.empty.srfPendingValidation',
    emptyDescriptionKey: 'admin.empty.srfPendingValidationDesc',
  },
  'late-payments': {
    queue: 'overdue',
    kpiKey: 'late',
    emptyTitleKey: 'admin.empty.srfLatePayments',
    emptyDescriptionKey: 'admin.empty.srfLatePaymentsDesc',
  },
  'blocked-students': {
    queue: 'blocked_exams',
    kpiKey: 'blocked',
    emptyTitleKey: 'admin.empty.srfBlockedStudents',
    emptyDescriptionKey: 'admin.empty.srfBlockedStudentsDesc',
  },
  'exempted-students': {
    queue: 'exempted',
    kpiKey: 'exempted',
    emptyTitleKey: 'admin.empty.srfExemptedStudents',
    emptyDescriptionKey: 'admin.empty.srfExemptedStudentsDesc',
  },
};
