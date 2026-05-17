import type { LucideIcon } from 'lucide-react';
import { FileEdit, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export interface EncadrantReportsSummaryStat {
  label: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
}

export const encadrantReportsSummaryStats: EncadrantReportsSummaryStat[] = [
  { label: 'Total Reports', value: 8, Icon: FileEdit, iconBgClass: 'bg-[#3b82f6]' },
  { label: 'Pending Review', value: 2, Icon: Clock, iconBgClass: 'bg-[#eab308]' },
  { label: 'Approved', value: 2, Icon: CheckCircle, iconBgClass: 'bg-[#22c55e]' },
  { label: 'Overdue', value: 1, Icon: AlertTriangle, iconBgClass: 'bg-[#ef4444]' }
];

export type EncadrantReportStatus = 'Submitted' | 'Pending' | 'Approved' | 'Overdue';

export interface EncadrantReportRow {
  id: string;
  encadrant: string;
  student: string;
  reportType: string;
  status: EncadrantReportStatus;
  submittedDate: string;
  dueDate: string;
}

export const encadrantReportsRows: EncadrantReportRow[] = [
  {
    id: '1',
    encadrant: 'Dr. Hassan Lemrani',
    student: 'Sarah Alami',
    reportType: 'Monthly Progress',
    status: 'Submitted',
    submittedDate: '15/04/2026',
    dueDate: '20/04/2026'
  },
  {
    id: '2',
    encadrant: 'Prof. Zineb Alaoui',
    student: 'Youssef Benani',
    reportType: 'Evaluation',
    status: 'Pending',
    submittedDate: '10/04/2026',
    dueDate: '18/04/2026'
  },
  {
    id: '3',
    encadrant: 'Dr. Ahmed Kettani',
    student: 'Amina Khalil',
    reportType: 'Final Report',
    status: 'Approved',
    submittedDate: '12/04/2026',
    dueDate: '15/04/2026'
  },
  {
    id: '4',
    encadrant: 'Prof. Laila Benjelloun',
    student: 'Mohamed Idrissi',
    reportType: 'Mid-term Review',
    status: 'Submitted',
    submittedDate: '14/04/2026',
    dueDate: '20/04/2026'
  },
  {
    id: '5',
    encadrant: 'Dr. Hassan Lemrani',
    student: 'Fatima Zahra',
    reportType: 'Weekly Update',
    status: 'Overdue',
    submittedDate: '05/04/2026',
    dueDate: '12/04/2026'
  },
  {
    id: '6',
    encadrant: 'Prof. Zineb Alaoui',
    student: 'Karim El Fassi',
    reportType: 'Progress Report',
    status: 'Approved',
    submittedDate: '08/04/2026',
    dueDate: '10/04/2026'
  },
  {
    id: '7',
    encadrant: 'Dr. Ahmed Kettani',
    student: 'Nadia Benjelloun',
    reportType: 'Monthly Progress',
    status: 'Pending',
    submittedDate: '16/04/2026',
    dueDate: '22/04/2026'
  },
  {
    id: '8',
    encadrant: 'Prof. Laila Benjelloun',
    student: 'Omar Rachidi',
    reportType: 'Final Report',
    status: 'Submitted',
    submittedDate: '17/04/2026',
    dueDate: '25/04/2026'
  }
];
