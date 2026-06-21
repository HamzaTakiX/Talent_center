import { useAcademicStructureCatalog } from '../academic-structure/hooks/useAcademicStructureCatalog';

/** Filter option labels sourced from the shared admin academic structure catalog. */
export function useStudentChatAcademicFilterOptions() {
  const { programs, classes, academicLevels } = useAcademicStructureCatalog();
  return { programs, classes, academicLevels };
}
