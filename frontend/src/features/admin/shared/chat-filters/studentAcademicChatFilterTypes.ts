export type StudentAcademicChatFilters = {
  programs: string[];
  academicLevels: string[];
  classes: string[];
};

export const EMPTY_STUDENT_ACADEMIC_CHAT_FILTERS: StudentAcademicChatFilters = {
  programs: [],
  academicLevels: [],
  classes: [],
};

export type StudentAcademicFields = {
  program: string;
  academicLevel: string;
  className: string;
};

export type StudentAcademicFilterCounts = {
  programs: Record<string, number>;
  academicLevels: Record<string, number>;
  classes: Record<string, number>;
};
