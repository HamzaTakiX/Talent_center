import { createContext, useContext, type ReactNode } from 'react';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import type { StudentDashboardViewModel } from '../types/studentDashboardData';

interface StudentDashboardContextValue {
  data: StudentDashboardViewModel;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const StudentDashboardContext = createContext<StudentDashboardContextValue | null>(null);

export function StudentDashboardProvider({ children }: { children: ReactNode }) {
  const value = useStudentDashboard();
  return (
    <StudentDashboardContext.Provider value={value}>{children}</StudentDashboardContext.Provider>
  );
}

export function useStudentDashboardContext(): StudentDashboardContextValue {
  const ctx = useContext(StudentDashboardContext);
  if (!ctx) {
    throw new Error('useStudentDashboardContext must be used within StudentDashboardProvider');
  }
  return ctx;
}
