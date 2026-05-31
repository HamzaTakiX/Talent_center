export type ReportsPendingSummaryTone = 'orange' | 'red' | 'green';

export type ReportsPendingSummaryIcon = 'document' | 'alert' | 'check';

export interface ReportsPendingSummaryStat {
  label: string;
  value: number;
  tone: ReportsPendingSummaryTone;
  icon: ReportsPendingSummaryIcon;
}

export type PendingReportStatus = 'late' | 'pending';

export interface PendingReportRow {
  id: string;
  student: string;
  report: string;
  deadline: string;
  lateNote?: string;
  status: PendingReportStatus;
}
