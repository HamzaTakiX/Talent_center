import type { StudentAtRiskAlert, StudentsAtRiskSummaryStat } from '../types';

export const studentsAtRiskSummaryMock: StudentsAtRiskSummaryStat[] = [
  { label: 'High Risk', value: 2, tone: 'red', icon: 'alert' },
  { label: 'Medium Risk', value: 1, tone: 'orange', icon: 'alert' },
  { label: 'Low Risk', value: 3, tone: 'green', icon: 'check' },
];

export const studentsAtRiskAlertsMock: StudentAtRiskAlert[] = [
  {
    id: '2',
    name: 'Youssef Benani',
    level: 'Master 2',
    company: 'LogiChain Solutions',
    riskLevel: 'high',
    riskLabel: 'High Risk',
    riskFactors: [
      { id: 'f1', label: 'Low Progress' },
      { id: 'f2', label: 'Late Reports' },
      { id: 'f3', label: 'Missing Meetings' },
    ],
    progress: 45,
    lastReport: '05/04/2026',
    nextDue: '20/04/2026',
  },
  {
    id: '4',
    name: 'Mohamed Idrissi',
    level: 'Master 1',
    company: 'SmartTech',
    riskLevel: 'medium',
    riskLabel: 'Medium Risk',
    riskFactors: [],
    progress: 60,
    lastReport: '08/04/2026',
    nextDue: '23/04/2026',
  },
];
