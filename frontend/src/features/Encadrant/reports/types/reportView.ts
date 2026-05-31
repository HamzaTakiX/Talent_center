export type ReportViewReviewStatus = 'pending_review' | 'validated';

export type ReportCommentAuthor = 'encadrant' | 'student';

export interface ReportViewComment {
  id: string;
  author: ReportCommentAuthor;
  authorName: string;
  message: string;
  timestamp: string;
}

export interface ReportViewDetail {
  studentId: string;
  reportId: string;
  title: string;
  submittedBy: string;
  submittedOn: string;
  reviewStatus: ReportViewReviewStatus;
  submittedDate: string;
  deadline: string;
  fileName: string;
  fileMeta: string;
  summary: string;
  comments: ReportViewComment[];
}
