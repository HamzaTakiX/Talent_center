import { useCallback, useMemo, useState } from 'react';
import { useStudentChatAcademicFilterOptions } from '../hooks/useStudentChatAcademicFilterOptions';
import {
  EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  type StudentAcademicChatFilters,
  type StudentAcademicFields,
} from './studentAcademicChatFilterTypes';
import {
  computeStudentAcademicFilterCounts,
  hasActiveStudentAcademicFilters,
  matchesStudentAcademicFilters,
  mergeStudentAcademicFilterOptions,
  restrictFilterCountsToCatalog,
  toggleFilterItem,
} from './studentAcademicChatFilterUtils';

interface Options<T> {
  includeArchived?: boolean;
  isArchived?: (conv: T) => boolean;
}

export function useStudentAcademicChatFilterState<T extends StudentAcademicFields>(
  conversations: T[],
  options?: Options<T>,
) {
  const [filters, setFilters] = useState<StudentAcademicChatFilters>({
    ...EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS,
  });
  const reference = useStudentChatAcademicFilterOptions();

  const activeConversations = useMemo(() => {
    if (options?.includeArchived) return conversations;
    return conversations.filter((c) => !(options?.isArchived?.(c) ?? false));
  }, [conversations, options?.includeArchived, options?.isArchived]);

  const rawFilterCounts = useMemo(
    () => computeStudentAcademicFilterCounts(activeConversations),
    [activeConversations],
  );

  const programOptions = useMemo(
    () => mergeStudentAcademicFilterOptions(reference.programs, rawFilterCounts.programs),
    [reference.programs, rawFilterCounts.programs],
  );

  const classOptions = useMemo(
    () => mergeStudentAcademicFilterOptions(reference.classes, rawFilterCounts.classes),
    [reference.classes, rawFilterCounts.classes],
  );

  const academicLevelOptions = useMemo(
    () => mergeStudentAcademicFilterOptions(reference.academicLevels, rawFilterCounts.academicLevels),
    [reference.academicLevels, rawFilterCounts.academicLevels],
  );

  const studentAcademicFilterCounts = useMemo(
    () => ({
      programs: restrictFilterCountsToCatalog(rawFilterCounts.programs, programOptions),
      classes: restrictFilterCountsToCatalog(rawFilterCounts.classes, classOptions),
      academicLevels: restrictFilterCountsToCatalog(
        rawFilterCounts.academicLevels,
        academicLevelOptions,
      ),
    }),
    [rawFilterCounts, programOptions, classOptions, academicLevelOptions],
  );

  const toggleStudentAcademicFilter = useCallback(
    (key: keyof StudentAcademicChatFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: toggleFilterItem(prev[key], value),
      }));
    },
    [],
  );

  const clearStudentAcademicFilters = useCallback(
    () => setFilters({ ...EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS }),
    [],
  );

  const matchesStudentAcademic = useCallback(
    (conv: StudentAcademicFields) => matchesStudentAcademicFilters(conv, filters),
    [filters],
  );

  return {
    studentAcademicFilters: filters,
    studentAcademicFilterCounts,
    programOptions,
    classOptions,
    academicLevelOptions,
    toggleStudentAcademicFilter,
    clearStudentAcademicFilters,
    hasActiveStudentAcademicFilters: hasActiveStudentAcademicFilters(filters),
    matchesStudentAcademic,
  };
}
