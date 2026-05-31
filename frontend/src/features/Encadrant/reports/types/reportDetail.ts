export type ReportRowStatus = 'pending' | 'validated';

export type ReportDetailStudentStatus = 'on_track' | 'at_risk' | 'ahead' | 'delayed';

export interface ReportDetailRow {
  id: string;
  title: string;
  submissionDate: string;
  deadline: string;
  status: ReportRowStatus;
  showValidate: boolean;
}

export interface StudentReportDetail {
  studentId: string;
  name: string;
  level: string;
  totalReports: number;
  status: ReportDetailStudentStatus;
  rows: ReportDetailRow[];
}
