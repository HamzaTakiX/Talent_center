import type { AdminEncadrantRow } from '../../../../api/types';
import { scopeProgramsPreview } from '../../../../shared/utils/programDisplay';

export function encadrantScopeLabel(row: AdminEncadrantRow, globalLabel = '—'): string {
  return scopeProgramsPreview(
    row.scopes?.filiere_codes,
    row.scopes?.filiere_labels,
    globalLabel,
    2,
  );
}

export function encadrantDepartmentOptions(rows: AdminEncadrantRow[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    const labels = row.scopes?.filiere_labels ?? row.scopes?.filiere_codes ?? [];
    if (labels.length === 0) {
      set.add('—');
    } else {
      for (const label of labels) {
        if (label.trim()) set.add(label.trim());
      }
    }
  }
  return [...set].sort();
}

export function encadrantMatchesDepartment(row: AdminEncadrantRow, departmentFilter: string): boolean {
  if (departmentFilter === 'all') return true;
  const labels = row.scopes?.filiere_labels ?? row.scopes?.filiere_codes ?? [];
  if (labels.length === 0) return departmentFilter === '—';
  return labels.some((label) => label.trim() === departmentFilter);
}
