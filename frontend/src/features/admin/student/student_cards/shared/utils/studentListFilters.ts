import type { AdminStudentRow } from '../../../../api/types';
import type { EngagementBand, StudentListSliceFilter } from '../types/studentListSlice';

export function isActiveStudent(row: AdminStudentRow): boolean {
  return (
    row.platform_access_granted &&
    (row.account_status === 'AUTHORIZED' || row.account_status === 'ACTIVE')
  );
}

export function engagementBand(row: AdminStudentRow): EngagementBand {
  const percent = row.intelligence?.engagement_score ?? row.onboarding_percent ?? 0;
  if (percent >= 66) return 'High';
  if (percent >= 36) return 'Medium';
  return 'Low';
}

export function filterStudentsBySlice(
  rows: AdminStudentRow[],
  filter: StudentListSliceFilter,
): AdminStudentRow[] {
  switch (filter) {
    case 'all':
    case 'engagement':
      return rows;
    case 'active':
      return rows.filter(isActiveStudent);
    case 'inactive':
      return rows.filter((row) => !isActiveStudent(row));
    case 'without_internship':
      return rows.filter((row) => !row.has_internship_assignment);
    case 'with_internship':
      return rows.filter((row) => row.has_internship_assignment);
    default:
      return rows;
  }
}

export function studentInternshipDisplayStatus(
  row: AdminStudentRow,
): 'Assigned' | 'Searching' | 'None' {
  if (row.has_internship_assignment) return 'Assigned';
  if (row.internship_type_id) return 'Searching';
  return 'None';
}
