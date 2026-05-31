export type ReportsLateSummaryTone = 'blue' | 'green' | 'red';

export type ReportsLateSummaryIcon = 'total' | 'submitted' | 'late';

export interface ReportsLateSummaryStat {
  label: string;
  value: number;
  tone: ReportsLateSummaryTone;
  icon: ReportsLateSummaryIcon;
}

export type ReportsLateStudentStatus = 'on_track' | 'at_risk' | 'ahead' | 'delayed';

export interface ReportsLateStudent {
  id: string;
  name: string;
  level: string;
  totalReports: number;
  lastReportTitle: string;
  lastReportDate: string;
  nextReportTitle: string;
  nextReportDue: string;
  progressPercent: number;
  status: ReportsLateStudentStatus;
  isOverdue?: boolean;
}
