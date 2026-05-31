/** Types — page Assigned Students. */

export type AssignedStudentsSummaryTone = 'blue' | 'green' | 'gray';

export type AssignedStudentRiskLevel = 'low' | 'medium' | 'high';

export interface AssignedStudentsSummaryStat {
  label: string;
  value: number;
  tone: AssignedStudentsSummaryTone;
  icon: 'users' | 'active' | 'inactive';
}

export interface AssignedStudentListItem {
  id: string;
  name: string;
  level: string;
  projectTitle: string;
  company: string;
  lastReport: string;
  nextMeeting: string;
  progress: number;
  riskLevel: AssignedStudentRiskLevel;
  riskLabel: string;
}
