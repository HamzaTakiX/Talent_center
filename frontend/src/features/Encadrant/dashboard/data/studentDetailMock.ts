import { assignedStudentsMock } from './dashboardMock';
import type { StudentDetail, StudentRecentReport } from '../types';

const sarahRecentReports: StudentRecentReport[] = [
  {
    id: 'r1',
    title: 'Monthly Progress Report - March',
    date: '10/04/2026',
    status: 'validated',
    statusLabel: 'Validated',
  },
  {
    id: 'r2',
    title: 'Technical Specifications Document',
    date: '05/04/2026',
    status: 'pending_review',
    statusLabel: 'Pending Review',
  },
  {
    id: 'r3',
    title: 'Literature Review',
    date: '28/03/2026',
    status: 'validated',
    statusLabel: 'Validated',
  },
];

const defaultRecentReportsForStudent = (
  studentName: string,
  lastReportDate: string,
): StudentRecentReport[] => [
  {
    id: 'r1',
    title: `Monthly Progress Report - ${studentName.split(' ')[0]}`,
    date: lastReportDate,
    status: 'validated',
    statusLabel: 'Validated',
  },
  {
    id: 'r2',
    title: 'Technical Specifications Document',
    date: lastReportDate,
    status: 'pending_review',
    statusLabel: 'Pending Review',
  },
  {
    id: 'r3',
    title: 'Literature Review',
    date: '28/03/2026',
    status: 'validated',
    statusLabel: 'Validated',
  },
];

const studentDetailExtras: Record<string, StudentRecentReport[]> = {
  '1': sarahRecentReports,
};

export const studentDetailsMock: StudentDetail[] = assignedStudentsMock.map((student) => ({
  ...student,
  recentReports:
    studentDetailExtras[student.id] ??
    defaultRecentReportsForStudent(student.name, student.lastReport),
}));

export const getStudentDetailById = (studentId: string): StudentDetail | undefined =>
  studentDetailsMock.find((student) => student.id === studentId);
