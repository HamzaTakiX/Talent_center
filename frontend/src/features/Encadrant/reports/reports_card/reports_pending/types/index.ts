export type ReportsPendingSummaryTone = 'blue' | 'green' | 'red';

export type ReportsPendingSummaryIcon = 'total' | 'submitted' | 'late';

export interface ReportsPendingSummaryStat {
  label: string;
  value: number;
  tone: ReportsPendingSummaryTone;
  icon: ReportsPendingSummaryIcon;
}

export type ReportsPendingStudentStatus = 'on_track' | 'at_risk' | 'ahead' | 'delayed';

export interface ReportsPendingStudent {
  id: string;
  name: string;
  level: string;
  totalReports: number;
  lastReportTitle: string;
  lastReportDate: string;
  nextReportTitle: string;
  nextReportDue: string;
  progressPercent: number;
  status: ReportsPendingStudentStatus;
  isOverdue?: boolean;
}
