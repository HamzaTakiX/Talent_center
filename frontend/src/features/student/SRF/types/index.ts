export type SrfFeeTabId = 'all' | 'unpaid' | 'partial' | 'paid' | 'late';

export type SrfFeeRowStatus = 'paid' | 'unpaid';

export interface SrfFeeTab {
  id: SrfFeeTabId;
  label: string;
  count: number;
}

export interface SrfFeeRow {
  id: string;
  feeType: string;
  dueDate: string;
  amountExpected: number;
  amountPaid: number;
  amountRemaining: number;
  status: SrfFeeRowStatus;
}

export interface SrfPaymentHistoryRow {
  id: string;
  date: string;
  type: 'Paiement' | 'Validation';
  description: string;
  amount: number;
  status: 'Validé' | 'Approuvé';
}

export interface SrfUpcomingDeadline {
  id: string;
  feeType: string;
  dueLabel: string;
  amount: number;
  daysLabel: string;
}
