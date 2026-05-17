export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'event', labelKey: 'event' },
  { value: 'interview', labelKey: 'interview' },
  { value: 'info', labelKey: 'info' },
] as const;

export const ANNOUNCEMENT_AUDIENCE_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'allStudents', labelKey: 'allStudents' },
  { value: 'finalYear', labelKey: 'finalYear' },
  { value: 'computerScience', labelKey: 'computerScience' },
] as const;

export const ANNOUNCEMENT_PRIORITY_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'low', labelKey: 'low' },
  { value: 'normal', labelKey: 'normal' },
  { value: 'high', labelKey: 'high' },
] as const;

export const ANNOUNCEMENT_VISIBILITY_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'faculty-students', labelKey: 'facultyStudents' },
  { value: 'students-only', labelKey: 'studentsOnly' },
  { value: 'internal', labelKey: 'internal' },
] as const;
