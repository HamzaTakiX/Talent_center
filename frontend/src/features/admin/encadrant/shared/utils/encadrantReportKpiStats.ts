import type { EncadrantReportRow } from '../../reports/data/encadrantReportsMock';

export interface EncadrantReportKpiStats {
  total: number;
  in_progress: number;
  pending: number;
  approved: number;
  overdue: number;
}

/** KPI rapports soumis par les encadrants. */
export function computeEncadrantReportKpiStats(rows: EncadrantReportRow[]): EncadrantReportKpiStats {
  return {
    total: rows.length,
    in_progress: rows.filter((r) => r.status === 'Submitted').length,
    pending: rows.filter((r) => r.status === 'Pending').length,
    approved: rows.filter((r) => r.status === 'Approved').length,
    overdue: rows.filter((r) => r.status === 'Overdue').length,
  };
}

export const EMPTY_ENCADRANT_REPORT_KPI: EncadrantReportKpiStats = {
  total: 0,
  in_progress: 0,
  pending: 0,
  approved: 0,
  overdue: 0,
};
