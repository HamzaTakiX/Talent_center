export type SrfFeeTabId = 'all' | 'unpaid' | 'partial' | 'paid' | 'late';

export type SrfFeeRowStatus = 'paid' | 'unpaid' | 'pending' | 'partial' | 'late';

export interface SrfFeeTab {
  id: SrfFeeTabId;
  label: string;
  count: number;
}

export interface SrfFeeRow {
  id: string;
  installmentId?: number;
  feeType: string;
  dueDate: string;
  amountExpected: number;
  amountPaid: number;
  amountRemaining: number;
  status: SrfFeeRowStatus;
  canPay: boolean;
}

export interface SrfPaymentHistoryRow {
  id: string;
  date: string;
  sortAt: number;
  type: 'payment' | 'verification';
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'correction' | 'validated';
}

export interface SrfUpcomingDeadline {
  id: string;
  feeType: string;
  dueLabel: string;
  amount: number;
  daysLabel: string;
}
