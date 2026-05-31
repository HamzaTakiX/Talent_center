import type { ReportsPendingStudent, ReportsPendingSummaryStat } from '../types';

export const reportsPendingSummaryMock: ReportsPendingSummaryStat[] = [
  { label: 'Total Reports', value: 58, tone: 'blue', icon: 'total' },
  { label: 'Submitted', value: 45, tone: 'green', icon: 'submitted' },
  { label: 'Late', value: 3, tone: 'red', icon: 'late' },
];

export const reportsPendingStudentsMock: ReportsPendingStudent[] = [
  {
    id: 'rp-pending-1',
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
    id: 'rp-pending-2',
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
    id: 'rp-pending-3',
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
