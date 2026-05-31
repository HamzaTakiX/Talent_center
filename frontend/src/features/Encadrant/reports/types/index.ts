export type ReportsSummaryTone = 'blue' | 'orange' | 'red' | 'green';

export type ReportsSummaryIcon = 'submitted' | 'pending' | 'late' | 'validated';

export interface ReportsSummaryStat {
  label: string;
  value: number;
  tone: ReportsSummaryTone;
  icon: ReportsSummaryIcon;
}

export type ReportStudentStatus = 'on_track' | 'at_risk' | 'ahead' | 'delayed';

export interface ReportStudent {
  id: string;
  name: string;
  level: string;
  status: ReportStudentStatus;
  totalReports: number;
  lastReportTitle: string;
  lastReportDate: string;
  nextReportTitle: string;
  nextReportDue: string;
  progressPercent: number;
}

export type {
  ReportDetailRow,
  ReportRowStatus,
  StudentReportDetail,
} from './reportDetail';

export type {
  ReportCommentAuthor,
  ReportViewComment,
  ReportViewDetail,
  ReportViewReviewStatus,
} from './reportView';
