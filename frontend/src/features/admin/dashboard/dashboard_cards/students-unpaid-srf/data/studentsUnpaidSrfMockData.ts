export type SrfPaymentStatus = 'unpaid' | 'partially_paid';

export interface StudentUnpaidSrfRow {
  name: string;
  classLevel: string;
  amountDue: string;
  status: SrfPaymentStatus;
}

export const STUDENTS_UNPAID_SRF_COUNT = 23;

export const studentsUnpaidSrfMockRows: StudentUnpaidSrfRow[] = [
  { name: 'Omar Khalil', classLevel: 'Master 1', amountDue: '15000 MAD', status: 'unpaid' },
  { name: 'Leila Mansouri', classLevel: 'Master 2', amountDue: '8000 MAD', status: 'partially_paid' },
];
