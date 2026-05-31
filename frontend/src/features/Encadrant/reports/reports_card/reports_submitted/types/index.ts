export type ReportsSubmittedSummaryTone = 'blue' | 'green' | 'red';

export type ReportsSubmittedSummaryIcon = 'total' | 'submitted' | 'late';

export interface ReportsSubmittedSummaryStat {
  label: string;
  value: number;
  tone: ReportsSubmittedSummaryTone;
  icon: ReportsSubmittedSummaryIcon;
}

export type ReportsSubmittedStudentStatus = 'on_track' | 'at_risk' | 'ahead' | 'delayed';

export interface ReportsSubmittedStudent {
  id: string;
  name: string;
  level: string;
  totalReports: number;
  lastReportTitle: string;
  lastReportDate: string;
  nextReportTitle: string;
  nextReportDue: string;
  progressPercent: number;
  status: ReportsSubmittedStudentStatus;
  isOverdue?: boolean;
}
