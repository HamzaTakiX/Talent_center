export interface CvAnalysisToolStudentProfile {
  name: string;
  role: string;
  avatarInitials: string;
  notificationCount: number;
}

export interface CvAnalysisToolCvFile {
  fileName: string;
  lastUpdated: string;
  sizeLabel: string;
  pageCount: number;
}

export interface CvAnalysisToolContextState {
  selectedOfferLabel: string | null;
  additionalDocumentLabel: string | null;
}
