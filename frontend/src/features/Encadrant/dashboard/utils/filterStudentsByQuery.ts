import type { AssignedStudent } from '../types';

export const filterStudentsByQuery = (
  students: AssignedStudent[],
  query: string,
): AssignedStudent[] => {
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
