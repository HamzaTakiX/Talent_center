import type {
  AcademicClassRow,
  AcademicLevelRow,
  AcademicTrackRow,
  ArchivedEntityKind,
  ArchivedEntityRow,
  InternshipFrameworkRow,
  WorkModeRow,
} from '../types/academicStructureTypes';
import { displayCellValue, formatAcademicCode, humanizeAcademicLabel } from './academicStructureDisplay';

export function buildArchivedRows(input: {
  tracks: AcademicTrackRow[];
  levels: AcademicLevelRow[];
  classes: AcademicClassRow[];
  internshipTypes: InternshipFrameworkRow[];
  workModes: WorkModeRow[];
}): ArchivedEntityRow[] {
  const rows: ArchivedEntityRow[] = [];

  for (const row of input.tracks.filter((r) => r.is_archived)) {
    rows.push({
      kind: 'FILIERE',
      id: row.id,
      name: humanizeAcademicLabel(row.name),
      code: formatAcademicCode(row.code),
      detail: row.program_family,
    });
  }

  for (const row of input.levels.filter((r) => r.is_archived)) {
    rows.push({
      kind: 'ACADEMIC_LEVEL',
      id: row.id,
      name: humanizeAcademicLabel(row.name),
      code: formatAcademicCode(row.code),
      context: displayCellValue(row.filiere_name) || formatAcademicCode(row.filiere_code),
    });
  }

  for (const row of input.classes.filter((r) => r.is_archived)) {
    rows.push({
      kind: 'CLASS_GROUP',
      id: row.id,
      name: humanizeAcademicLabel(row.name),
      code: formatAcademicCode(row.code),
      context: displayCellValue(row.filiere_name),
      detail: displayCellValue(row.academic_level_label) || row.academic_year,
    });
  }

  for (const row of input.internshipTypes.filter((r) => r.is_archived)) {
    rows.push({
      kind: 'INTERNSHIP_TYPE',
      id: row.id,
      name: humanizeAcademicLabel(row.name),
      code: formatAcademicCode(row.code),
      context: displayCellValue(row.filiere_name),
      detail: displayCellValue(row.duration_hint),
    });
  }

  for (const row of input.workModes.filter((r) => r.is_archived)) {
    rows.push({
      kind: 'WORK_MODE',
      id: row.id,
      name: humanizeAcademicLabel(row.name),
      code: formatAcademicCode(row.code),
    });
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}
