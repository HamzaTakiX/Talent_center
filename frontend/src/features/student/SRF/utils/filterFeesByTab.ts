import type { SrfFeeRow, SrfFeeTabId } from '../types';

export function filterFeesByTab(rows: SrfFeeRow[], tabId: SrfFeeTabId): SrfFeeRow[] {
  switch (tabId) {
    case 'all':
      return rows;
    case 'unpaid':
      return rows.filter((row) => row.status === 'unpaid');
    case 'partial':
      return rows.filter(
        (row) => row.amountPaid > 0 && row.amountRemaining > 0 && row.status !== 'unpaid'
      );
    case 'paid':
      return rows.filter((row) => row.status === 'paid');
    case 'late':
      return [];
    default:
      return rows;
  }
}
