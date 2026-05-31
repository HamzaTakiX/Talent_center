import type { ReportDetailRow, StudentReportDetail } from '../types';
import { reportStudentsMock } from './reportsMock';

const sarahReportRows: ReportDetailRow[] = [
  {
    id: 'rpt-1',
    title: 'Monthly Progress - March',
    submissionDate: '10/04/2026',
    deadline: '12/04/2026',
    status: 'pending',
    showValidate: true,
  },
  {
    id: 'rpt-2',
    title: 'Technical Specifications',
    submissionDate: '28/03/2026',
    deadline: '30/03/2026',
    status: 'validated',
    showValidate: false,
  },
  {
    id: 'rpt-3',
    title: 'Literature Review',
    submissionDate: '15/03/2026',
    deadline: '18/03/2026',
    status: 'validated',
    showValidate: false,
  },
  {
    id: 'rpt-4',
    title: 'Project Proposal',
    submissionDate: '01/03/2026',
    deadline: '05/03/2026',
    status: 'validated',
    showValidate: false,
  },
  {
    id: 'rpt-5',
    title: 'Initial Research',
    submissionDate: '15/02/2026',
    deadline: '20/02/2026',
    status: 'validated',
    showValidate: false,
  },
];

const buildDefaultRows = (studentName: string, lastTitle: string): ReportDetailRow[] => [
  {
    id: 'rpt-pending',
    title: lastTitle,
    submissionDate: '10/04/2026',
    deadline: '12/04/2026',
    status: 'pending',
    showValidate: true,
  },
  {
    id: 'rpt-v1',
    title: 'Previous Report - Phase 2',
    submissionDate: '28/03/2026',
    deadline: '30/03/2026',
    status: 'validated',
    showValidate: false,
  },
  {
    id: 'rpt-v2',
    title: 'Mid-term Summary',
    submissionDate: '15/03/2026',
    deadline: '18/03/2026',
    status: 'validated',
    showValidate: false,
  },
  {
    id: 'rpt-v3',
    title: `${studentName.split(' ')[0]} — Project Update`,
    submissionDate: '01/03/2026',
    deadline: '05/03/2026',
    status: 'validated',
    showValidate: false,
  },
];

export const getStudentReportDetail = (studentId: string): StudentReportDetail | undefined => {
  const student = reportStudentsMock.find((s) => s.id === studentId);
  if (!student) return undefined;

  const rows =
    studentId === 'rp-1'
      ? sarahReportRows
      : buildDefaultRows(student.name, student.lastReportTitle);

  return {
    studentId: student.id,
    name: student.name,
    level: student.level,
    totalReports: student.totalReports,
    status: student.status,
    rows,
  };
};
