import type { AdminAdministratorRow, AdminEncadrantRow, AdminStudentRow } from '../../../../api/types';
import { programTableLabel, scopeProgramsPreview } from '../../../../shared/utils/programDisplay';

export function studentFieldLabel(row: AdminStudentRow): string {
  return programTableLabel(row.filiere_code, row.program_major);
}

export function encadrantProgramsLabel(
  row: AdminEncadrantRow,
  globalLabel: string,
): string {
  return scopeProgramsPreview(
    row.scopes?.filiere_codes,
    row.scopes?.filiere_labels,
    globalLabel,
    3,
  );
}

export function administratorRolesKey(row: AdminAdministratorRow): string {
  if (row.role_slugs.length === 0) return 'none';
  return row.role_slugs.join(',');
}
