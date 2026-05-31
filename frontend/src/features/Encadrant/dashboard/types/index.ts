/** Types — module Dashboard Encadrant. */

export type StudentRiskLevel = 'low' | 'medium' | 'high';

export type DashboardStatTone = 'blue' | 'red' | 'orange' | 'green';

export type StudentReportStatus = 'validated' | 'pending_review';

export interface DashboardStatItem {
  label: string;
  value: number;
  tone: DashboardStatTone;
  icon: 'users' | 'alert' | 'reports' | 'calendar';
}

export interface AssignedStudent {
  id: string;
  name: string;
  level: string;
  projectTitle: string;
  company: string;
  lastReport: string;
  nextReport: string;
  nextMeeting: string;
  progress: number;
  riskLevel: StudentRiskLevel;
  riskLabel: string;
}

export interface StudentRecentReport {
  id: string;
  title: string;
  date: string;
  status: StudentReportStatus;
  statusLabel: string;
}

export interface StudentDetail extends AssignedStudent {
  recentReports: StudentRecentReport[];
}
