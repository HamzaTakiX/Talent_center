import type { ReportViewDetail } from '../types';
import { getStudentReportDetail } from './reportDetailMock';

const defaultComments: ReportViewDetail['comments'] = [
  {
    id: 'cmt-1',
    author: 'encadrant',
    authorName: 'You',
    message:
      'Good progress overall. Please add more details about the model architecture.',
    timestamp: '11 avr., 10:30',
  },
  {
    id: 'cmt-2',
    author: 'student',
    authorName: 'Sarah Alami',
    message:
      "Thank you for the feedback. I've updated the section with detailed architecture diagrams.",
    timestamp: '11 avr., 14:20',
  },
  {
    id: 'cmt-3',
    author: 'encadrant',
    authorName: 'You',
    message:
      'Perfect! The diagrams are very clear. One minor suggestion: add performance metrics.',
    timestamp: '11 avr., 16:45',
  },
];

const sarahMarchView: ReportViewDetail = {
  studentId: 'rp-1',
  reportId: 'rpt-1',
  title: 'Monthly Progress Report - March 2026',
  submittedBy: 'Sarah Alami',
  submittedOn: '10/04/2026',
  reviewStatus: 'pending_review',
  submittedDate: '10/04/2026',
  deadline: '12/04/2026',
  fileName: 'progress-report-march.pdf',
  fileMeta: 'PDF Document • 2.4 MB',
  summary:
    'This report summarizes the progress made during March 2026 on the AI-Powered Chatbot project. Key achievements include completing the natural language processing module, implementing the conversation flow engine, and conducting initial user testing with positive results. The team has also made significant progress on database optimization and API integration.',
  comments: defaultComments,
};

export const getReportView = (
  studentId: string,
  reportId: string
): ReportViewDetail | undefined => {
  const studentDetail = getStudentReportDetail(studentId);
  if (!studentDetail) return undefined;

  const row = studentDetail.rows.find((r) => r.id === reportId);
  if (!row) return undefined;

  if (studentId === 'rp-1' && reportId === 'rpt-1') {
    return sarahMarchView;
  }

  const reviewStatus = row.status === 'validated' ? 'validated' : 'pending_review';

  return {
    studentId,
    reportId,
    title: `${row.title} Report`,
    submittedBy: studentDetail.name,
    submittedOn: row.submissionDate,
    reviewStatus,
    submittedDate: row.submissionDate,
    deadline: row.deadline,
    fileName: `${row.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    fileMeta: 'PDF Document • 1.8 MB',
    summary: `This report covers ${row.title.toLowerCase()} submitted by ${studentDetail.name}. It documents project milestones, current implementation status, and planned next steps for the upcoming review period.`,
    comments: defaultComments.map((comment) =>
      comment.author === 'student'
        ? { ...comment, authorName: studentDetail.name }
        : comment
    ),
  };
};
