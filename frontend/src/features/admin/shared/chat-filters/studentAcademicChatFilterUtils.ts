import type {
  StudentAcademicChatFilters,
  StudentAcademicFields,
  StudentAcademicFilterCounts,
} from './studentAcademicChatFilterTypes';

export function toggleFilterItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function matchesInFilterArray<T>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

export function matchesStudentAcademicFilters(
  conv: StudentAcademicFields,
  filters: StudentAcademicChatFilters,
): boolean {
  if (!matchesInFilterArray(filters.programs, conv.program)) return false;
  if (!matchesInFilterArray(filters.academicLevels, conv.academicLevel)) return false;
  if (!matchesInFilterArray(filters.classes, conv.className)) return false;
  return true;
}

export function hasActiveStudentAcademicFilters(filters: StudentAcademicChatFilters): boolean {
  return (
    filters.programs.length > 0 ||
    filters.academicLevels.length > 0 ||
    filters.classes.length > 0
  );
}

export function computeStudentAcademicFilterCounts<T extends StudentAcademicFields>(
  conversations: T[],
): StudentAcademicFilterCounts {
  const countField = (items: T[], key: keyof StudentAcademicFields) => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const val = String(item[key]);
      if (val && val !== '—') counts[val] = (counts[val] ?? 0) + 1;
    }
    return counts;
  };
  return {
    programs: countField(conversations, 'program'),
    academicLevels: countField(conversations, 'academicLevel'),
    classes: countField(conversations, 'className'),
  };
}

export function mergeStudentAcademicFilterOptions(
  reference: string[],
  _fromConv: Record<string, number>,
): string[] {
  return [...reference].sort((a, b) => a.localeCompare(b, 'fr'));
}

/** Keep badge counts only for labels defined in the structure catalog. */
export function restrictFilterCountsToCatalog(
  counts: Record<string, number>,
  catalogLabels: string[],
): Record<string, number> {
  const allowed = new Set(catalogLabels);
  const result: Record<string, number> = {};
  for (const [key, count] of Object.entries(counts)) {
    if (allowed.has(key)) result[key] = count;
  }
  return result;
}
