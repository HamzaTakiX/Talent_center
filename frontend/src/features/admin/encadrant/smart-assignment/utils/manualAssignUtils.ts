import type {
  SmartAssignmentEncadrantCard,
  SmartAssignmentResultsPayload,
  SmartAssignmentStudentRow,
} from '../../../api/types';

export type ManualAssignFilter = 'all' | 'compatible' | 'assigned' | 'unassigned';

export interface ManualAssignStudentEntry {
  student: SmartAssignmentStudentRow;
  assignedEncadrantId: number | null;
  assignedEncadrantName: string | null;
  compatible: boolean;
  isCurrentEncadrant: boolean;
}

export interface ManualAssignLevelGroup {
  level: string;
  students: ManualAssignStudentEntry[];
}

export interface ManualAssignFiliereGroup {
  filiere: string;
  levels: ManualAssignLevelGroup[];
  studentCount: number;
}

function normalize(value: string | undefined | null): string {
  return (value ?? '').trim().toLowerCase();
}

function listIncludes(values: string[] | undefined, candidate: string | undefined): boolean {
  if (!values?.length || !candidate) return true;
  const needle = normalize(candidate);
  return values.some((item) => normalize(item) === needle);
}

export function isStudentCompatibleWithEncadrant(
  student: SmartAssignmentStudentRow,
  encadrant: SmartAssignmentEncadrantCard,
): boolean {
  const scope = encadrant.scope;
  if (scope?.filiere_labels?.length || scope?.filiere_codes?.length) {
    const filiereOk =
      listIncludes(scope.filiere_labels, student.filiere) ||
      listIncludes(scope.filiere_codes, student.filiere_code);
    if (!filiereOk) return false;
  }
  if (scope?.level_labels?.length && !listIncludes(scope.level_labels, student.level)) {
    return false;
  }
  if (scope?.sector_labels?.length && student.sector && !listIncludes(scope.sector_labels, student.sector)) {
    return false;
  }
  const supervisedNames =
    encadrant.supervised_internship_types?.map((item) => item.name).filter(Boolean) ?? [];
  if (supervisedNames.length && student.internship_type) {
    if (!listIncludes(supervisedNames, student.internship_type)) return false;
  }
  return true;
}

export function buildEncadrantAssignmentMap(
  data: SmartAssignmentResultsPayload,
): Map<number, { encadrantId: number; encadrantName: string }> {
  const map = new Map<number, { encadrantId: number; encadrantName: string }>();
  for (const enc of data.encadrants) {
    for (const student of enc.students) {
      map.set(student.student_profile_id, {
        encadrantId: enc.encadrant_profile_id,
        encadrantName: enc.full_name,
      });
    }
  }
  return map;
}

export function collectEligibleStudents(data: SmartAssignmentResultsPayload): SmartAssignmentStudentRow[] {
  const byId = new Map<number, SmartAssignmentStudentRow>();
  for (const student of data.unassigned_students) {
    byId.set(student.student_profile_id, student);
  }
  for (const enc of data.encadrants) {
    for (const student of enc.students) {
      byId.set(student.student_profile_id, student);
    }
  }
  return Array.from(byId.values());
}

export function buildManualAssignGroups(
  students: SmartAssignmentStudentRow[],
  encadrant: SmartAssignmentEncadrantCard,
  assignmentMap: Map<number, { encadrantId: number; encadrantName: string }>,
  query: string,
  filter: ManualAssignFilter,
): ManualAssignFiliereGroup[] {
  const needle = normalize(query);
  const entries: ManualAssignStudentEntry[] = students
    .map((student) => {
      const assignment = assignmentMap.get(student.student_profile_id) ?? null;
      const isCurrentEncadrant = assignment?.encadrantId === encadrant.encadrant_profile_id;
      const compatible = isStudentCompatibleWithEncadrant(student, encadrant);
      return {
        student,
        assignedEncadrantId: assignment?.encadrantId ?? null,
        assignedEncadrantName: assignment?.encadrantName ?? null,
        compatible,
        isCurrentEncadrant,
      };
    })
    .filter((entry) => {
      if (filter === 'compatible' && !entry.compatible) return false;
      if (filter === 'assigned' && !entry.isCurrentEncadrant) return false;
      if (filter === 'unassigned' && entry.assignedEncadrantId !== null) return false;
      if (!needle) return true;
      const haystack = [
        entry.student.full_name,
        entry.student.email,
        entry.student.filiere,
        entry.student.level,
        entry.student.sector,
        entry.student.internship_type,
        entry.student.class_name,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });

  const filiereMap = new Map<string, Map<string, ManualAssignStudentEntry[]>>();
  for (const entry of entries) {
    const filiere = entry.student.filiere?.trim() || '—';
    const level = entry.student.level?.trim() || '—';
    if (!filiereMap.has(filiere)) filiereMap.set(filiere, new Map());
    const levelMap = filiereMap.get(filiere)!;
    if (!levelMap.has(level)) levelMap.set(level, []);
    levelMap.get(level)!.push(entry);
  }

  return Array.from(filiereMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([filiere, levelMap]) => {
      const levels = Array.from(levelMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([level, levelStudents]) => ({
          level,
          students: levelStudents.sort((a, b) =>
            a.student.full_name.localeCompare(b.student.full_name),
          ),
        }));
      return {
        filiere,
        levels,
        studentCount: levels.reduce((sum, group) => sum + group.students.length, 0),
      };
    })
    .filter((group) => group.studentCount > 0);
}

export function encadrantHasCapacity(encadrant: SmartAssignmentEncadrantCard): boolean {
  if (!encadrant.max_capacity) return true;
  return encadrant.current_load < encadrant.max_capacity;
}
