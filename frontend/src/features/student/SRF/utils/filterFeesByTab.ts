import type { SrfFeeRow, SrfFeeTabId } from '../types';

export function filterFeesByTab(rows: SrfFeeRow[], tabId: SrfFeeTabId): SrfFeeRow[] {
  switch (tabId) {
    case 'all':
      return rows;
    case 'unpaid':
      return rows.filter((row) => row.status === 'unpaid' || row.status === 'late');
    case 'partial':
      return rows.filter((row) => row.status === 'partial');
    case 'paid':
      return rows.filter((row) => row.status === 'paid');
    case 'late':
      return rows.filter((row) => row.status === 'late');
    default:
      return rows;
  }
}
