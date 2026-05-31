import type { AssignedStudentListItem } from '../types';

export const filterAssignedStudents = (
  students: AssignedStudentListItem[],
  query: string,
): AssignedStudentListItem[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return students;

  return students.filter((student) => {
    const haystack = [
      student.name,
      student.level,
      student.projectTitle,
      student.company,
      student.riskLabel,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
};
