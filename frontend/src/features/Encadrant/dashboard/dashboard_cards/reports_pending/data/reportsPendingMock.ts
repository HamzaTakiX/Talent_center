import type { PendingReportRow, ReportsPendingSummaryStat } from '../types';

export const reportsPendingSummaryMock: ReportsPendingSummaryStat[] = [
  { label: 'Total Pending', value: 5, tone: 'orange', icon: 'document' },
  { label: 'Late Reports', value: 2, tone: 'red', icon: 'alert' },
  { label: 'On-Time Reports', value: 3, tone: 'green', icon: 'check' },
];

export const reportsPendingRowsMock: PendingReportRow[] = [
  {
    id: '1',
    student: 'Youssef Benani',
    report: 'Implementation Plan',
    deadline: '20/04/2026',
    lateNote: '2 days late',
    status: 'late',
  },
  {
    id: '2',
    student: 'Karim El Fassi',
    report: 'Requirements Document',
    deadline: '16/04/2026',
    lateNote: '6 days late',
    status: 'late',
  },
  {
    id: '3',
    student: 'Sarah Alami',
    report: 'Technical Specifications',
    deadline: '25/04/2026',
    status: 'pending',
  },
  {
    id: '4',
    student: 'Mohamed Idrissi',
    report: 'Integration Testing Report',
    deadline: '23/04/2026',
    status: 'pending',
  },
  {
    id: '5',
    student: 'Fatima Zahra',
    report: 'Performance Analysis',
    deadline: '30/04/2026',
    status: 'pending',
  },
];
