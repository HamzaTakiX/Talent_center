import type { ReportsValidatedStudent, ReportsValidatedSummaryStat } from '../types';

export const reportsValidatedSummaryMock: ReportsValidatedSummaryStat[] = [
  { label: 'Total Reports', value: 58, tone: 'blue', icon: 'total' },
  { label: 'Submitted', value: 45, tone: 'green', icon: 'submitted' },
  { label: 'Late', value: 3, tone: 'red', icon: 'late' },
];

export const reportsValidatedStudentsMock: ReportsValidatedStudent[] = [
  {
    id: 'rp-validated-1',
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
    id: 'rp-validated-2',
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
  {
    id: 'rp-validated-3',
    name: 'Mohamed Idrissi',
    level: 'Master 1',
    totalReports: 7,
    lastReportTitle: 'Project Proposal',
    lastReportDate: '08/04/2026',
    nextReportTitle: 'Mid-term Progress Report',
    nextReportDue: '22/04/2026',
    progressPercent: 60,
    status: 'on_track',
  },
];
