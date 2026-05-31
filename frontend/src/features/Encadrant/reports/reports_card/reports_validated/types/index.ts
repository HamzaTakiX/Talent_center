export type ReportsValidatedSummaryTone = 'blue' | 'green' | 'red';

export type ReportsValidatedSummaryIcon = 'total' | 'submitted' | 'late';

export interface ReportsValidatedSummaryStat {
  label: string;
  value: number;
  tone: ReportsValidatedSummaryTone;
  icon: ReportsValidatedSummaryIcon;
}

export type ReportsValidatedStudentStatus = 'on_track' | 'at_risk' | 'ahead' | 'delayed';

export interface ReportsValidatedStudent {
  id: string;
  name: string;
  level: string;
  totalReports: number;
  lastReportTitle: string;
  lastReportDate: string;
  nextReportTitle: string;
  nextReportDue: string;
  progressPercent: number;
  status: ReportsValidatedStudentStatus;
  isOverdue?: boolean;
}
