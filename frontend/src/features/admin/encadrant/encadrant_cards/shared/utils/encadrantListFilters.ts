import type { AdminEncadrantRow } from '../../../../api/types';
import type { EncadrantListSliceFilter } from '../types/encadrantListSlice';

export function filterEncadrantsBySlice(
  rows: AdminEncadrantRow[],
  filter: EncadrantListSliceFilter,
): AdminEncadrantRow[] {
  switch (filter) {
    case 'with_students':
    case 'meetings':
      return rows.filter((row) => row.current_students > 0);
    case 'reports_in_progress':
      // Pas encore d’API rapports ↔ encadrants : liste vide jusqu’à branchement backend.
      return [];
    case 'all':
    default:
      return rows;
  }
}
