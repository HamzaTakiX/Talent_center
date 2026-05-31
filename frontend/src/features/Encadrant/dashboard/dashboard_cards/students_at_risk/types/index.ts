/** Types — page Students at Risk. */

export type StudentsAtRiskLevel = 'high' | 'medium' | 'low';

export type StudentsAtRiskSummaryTone = 'red' | 'orange' | 'green';

export interface StudentsAtRiskSummaryStat {
  label: string;
  value: number;
  tone: StudentsAtRiskSummaryTone;
  icon: 'alert' | 'check';
}

export interface StudentRiskFactor {
  id: string;
  label: string;
}

export interface StudentAtRiskAlert {
  id: string;
  name: string;
  level: string;
  company: string;
  riskLevel: StudentsAtRiskLevel;
  riskLabel: string;
  riskFactors: StudentRiskFactor[];
  progress: number;
  lastReport: string;
  nextDue: string;
}
