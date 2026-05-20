import type { EncadrantReportRow } from '../data/encadrantReportsMock';
import type { EncadrantReportListFilter } from '../types/encadrantReportListSlice';

export function filterEncadrantReportsBySlice(
  rows: EncadrantReportRow[],
  filter: EncadrantReportListFilter,
): EncadrantReportRow[] {
  switch (filter) {
    case 'all':
      return rows;
    case 'in_progress':
      return rows.filter((r) => r.status === 'Submitted');
    case 'pending':
      return rows.filter((r) => r.status === 'Pending');
    case 'approved':
      return rows.filter((r) => r.status === 'Approved');
    case 'overdue':
      return rows.filter((r) => r.status === 'Overdue');
    case 'critical':
    case 'pending_validation':
    case 'risk_alerts':
      return rows;
    default:
      return rows;
  }
}
