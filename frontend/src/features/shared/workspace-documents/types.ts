export type WorkspaceDocumentCategory =
  | 'report'
  | 'research'
  | 'internship'
  | 'meeting'
  | 'shared';

export type WorkspaceDocumentReviewStatus = 'pending' | 'in_review' | 'resolved';

export interface WorkspaceDocumentReview {
  comment: string;
  grade: string;
  status: WorkspaceDocumentReviewStatus;
  authorName: string;
  updatedAt: string | null;
}

export interface WorkspaceDocument {
  id: number;
  name: string;
  category: WorkspaceDocumentCategory;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  sizeLabel: string;
  version: string;
  uploadedBy: {
    id: number | null;
    name: string;
  };
  uploadedAt: string | null;
  review: WorkspaceDocumentReview | null;
  viewedByEncadrant: boolean;
  viewedByEncadrantAt: string | null;
}

export interface WorkspaceDocumentReviewPayload {
  comment: string;
  grade?: string;
  status?: WorkspaceDocumentReviewStatus;
}
