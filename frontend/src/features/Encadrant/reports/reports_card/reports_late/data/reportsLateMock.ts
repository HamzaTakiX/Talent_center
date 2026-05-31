import type { ReportsLateStudent, ReportsLateSummaryStat } from '../types';

export const reportsLateSummaryMock: ReportsLateSummaryStat[] = [
  { label: 'Total Reports', value: 58, tone: 'blue', icon: 'total' },
  { label: 'Submitted', value: 45, tone: 'green', icon: 'submitted' },
  { label: 'Late', value: 3, tone: 'red', icon: 'late' },
];

export const reportsLateStudentsMock: ReportsLateStudent[] = [
  {
    id: 'rp-late-1',
    name: 'Karim El Fassi',
    level: 'Master 2',
    totalReports: 4,
    lastReportTitle: 'Research Methodology',
    lastReportDate: '28/03/2026',
    nextReportTitle: 'Progress Update - April',
    nextReportDue: '16/04/2026',
    progressPercent: 30,
    status: 'delayed',
    isOverdue: true,
  },
];
