import { useMemo } from 'react';
import { useCollaborationContext } from '../hooks/useCollaborationContext';

/** Resolve a backend student_profile_id for encadrant-side meeting actions. */
export function useEncadrantStudentProfileId(studentDisplayName?: string): number | undefined {
  const { context } = useCollaborationContext();

  return useMemo(() => {
    const students = context?.students ?? [];
    if (!students.length) return undefined;
    if (studentDisplayName) {
      const normalized = studentDisplayName.trim().toLowerCase();
      const match = students.find(
        (student) => student.display_name.trim().toLowerCase() === normalized,
      );
      if (match?.profile_id) return match.profile_id;
    }
    if (students.length === 1) return students[0]?.profile_id ?? undefined;
    return undefined;
  }, [context?.students, studentDisplayName]);
}
