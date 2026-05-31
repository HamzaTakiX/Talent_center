import type { ReportsSubmittedStudent, ReportsSubmittedSummaryStat } from '../types';

export const reportsSubmittedSummaryMock: ReportsSubmittedSummaryStat[] = [
  { label: 'Total Reports', value: 58, tone: 'blue', icon: 'total' },
  { label: 'Submitted', value: 45, tone: 'green', icon: 'submitted' },
  { label: 'Late', value: 3, tone: 'red', icon: 'late' },
];

export const reportsSubmittedStudentsMock: ReportsSubmittedStudent[] = [
  {
    id: 'rp-1',
    name: 'Sarah Alami',
    level: 'Master 2',
    totalReports: 8,
    lastReportTitle: 'Monthly Progress - March',
    lastReportDate: '10/04/2026',
    nextReportTitle: 'Technical Specifications',
    nextReportDue: '25/04/2026',
    progressPercent: 75,
    status: 'on_track',
  },
  {
    id: 'rp-2',
    name: 'Youssef Benani',
    level: 'Master 2',
    totalReports: 6,
    lastReportTitle: 'Literature Review',
    lastReportDate: '05/04/2026',
    nextReportTitle: 'Implementation Plan',
    nextReportDue: '20/04/2026',
    progressPercent: 50,
    status: 'at_risk',
  },
  {
    id: 'rp-3',
    name: 'Amina Khalil',
    level: 'Master 2',
    totalReports: 10,
    lastReportTitle: 'Final Testing Results',
    lastReportDate: '15/04/2026',
    nextReportTitle: 'Final Report Draft',
    nextReportDue: '28/04/2026',
    progressPercent: 90,
    status: 'ahead',
  },
];
