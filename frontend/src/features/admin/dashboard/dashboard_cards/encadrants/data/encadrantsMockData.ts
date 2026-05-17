export interface EncadrantRow {
  name: string;
  department: string;
  studentsAssigned: number;
}

export const TOTAL_ENCADRANTS_COUNT = 89;

export const encadrantsMockRows: EncadrantRow[] = [
  { name: 'Dr. Ahmed Bennani', department: 'Computer Science', studentsAssigned: 15 },
  { name: 'Pr. Fatima El Amrani', department: 'AI & Data Science', studentsAssigned: 12 },
  { name: 'Dr. Youssef Idrissi', department: 'Software Engineering', studentsAssigned: 18 },
];
