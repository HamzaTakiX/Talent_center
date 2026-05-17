export interface StudentRow {
  name: string;
  classLevel: string;
  field: string;
  status: 'active';
}

export const TOTAL_STUDENTS_COUNT = 1245;

export const studentsMockRows: StudentRow[] = [
  { name: 'Sarah Alami', classLevel: 'Master 2', field: 'AI & Data Science', status: 'active' },
  { name: 'Youssef Benani', classLevel: 'Master 1', field: 'Software Engineering', status: 'active' },
  { name: 'Amina Khalil', classLevel: 'Master 2', field: 'Cybersecurity', status: 'active' },
  { name: 'Mohamed Idrissi', classLevel: 'Master 1', field: 'Business Intelligence', status: 'active' },
  { name: 'Fatima Zahra', classLevel: 'Master 2', field: 'AI & Data Science', status: 'active' },
];
