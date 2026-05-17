export interface StudentWithoutInternshipRow {
  name: string;
  classLevel: string;
  field: string;
}

export const STUDENTS_WITHOUT_INTERNSHIP_COUNT = 156;

export const studentsWithoutInternshipMockRows: StudentWithoutInternshipRow[] = [
  { name: 'Omar Khalil', classLevel: 'Master 2', field: 'AI' },
  { name: 'Leila Mansouri', classLevel: 'Master 1', field: 'Software' },
  { name: 'Karim Tazi', classLevel: 'Master 2', field: 'Data Science' },
];
