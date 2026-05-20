import type { AdminEncadrantRow } from '../../../../api/types';

export interface EncadrantDashboardStats {
  total: number;
  total_assigned_students: number;
  active_encadrants: number;
  with_students: number;
  without_students: number;
  inactive_encadrants: number;
}

export function computeEncadrantStatsFromRows(rows: AdminEncadrantRow[]): EncadrantDashboardStats {
  const active = rows.filter((row) => row.is_encadrant_active).length;
  const withStudents = rows.filter((row) => row.current_students > 0).length;
  return {
    total: rows.length,
    total_assigned_students: rows.reduce((sum, row) => sum + row.current_students, 0),
    active_encadrants: active,
    inactive_encadrants: Math.max(0, rows.length - active),
    with_students: withStudents,
    without_students: Math.max(0, rows.length - withStudents),
  };
}
