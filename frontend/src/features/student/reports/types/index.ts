export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'needs_revision'
  | 'approved'
  | 'rejected'
  | 'archived';

export type ReportSectionStatus = 'complete' | 'draft' | 'empty';

export type ReportHubCategory = 'my' | 'drafts' | 'submitted' | 'templates' | 'archived';

export type ReportRightPanelTab = 'comments' | 'suggestions' | 'supervisor' | 'ai';

export type ReferenceStyle = 'apa' | 'ieee' | 'harvard';

export type AutoSaveState = 'idle' | 'saving' | 'saved';

export interface ReportSection {
  id: string;
  title: string;
  wordCount: number;
  completionPercent: number;
  status: ReportSectionStatus;
  content: string;
}

export interface ReportComment {
  id: string;
  author: string;
  role: 'supervisor' | 'student' | 'peer';
  text: string;
  sectionId: string;
  createdAt: string;
  resolved: boolean;
  fixed: boolean;
  replies: { id: string; author: string; text: string; createdAt: string }[];
}

export interface ReportReference {
  id: string;
  style: ReferenceStyle;
  authors: string;
  title: string;
  year: string;
  source: string;
}

export interface ReportVersion {
  id: string;
  label: string;
  createdAt: string;
  wordCount: number;
  snapshot: Record<string, string>;
  isCurrent?: boolean;
}

export interface ReportAnalytics {
  wordCount: number;
  completionPercent: number;
  readingTimeMinutes: number;
  referenceCount: number;
  imageCount: number;
}

export interface ReportAcademicProgress {
  reportCompletion: number;
  researchCompletion: number;
  supervisorReviews: number;
  documentCompletion: number;
}

export interface StudentReportSummary {
  id: string;
  title: string;
  lastModified: string;
  progress: number;
  supervisor: string;
  status: ReportStatus;
  wordCount: number;
  category: ReportHubCategory;
  isTemplate?: boolean;
}

export interface StudentReportDocument {
  id: string;
  title: string;
  status: ReportStatus;
  supervisor: string;
  targetWords: number;
  /** Free-form document body (primary editor content) */
  content: string;
  sections: ReportSection[];
  comments: ReportComment[];
  references: ReportReference[];
  versions: ReportVersion[];
  analytics: ReportAcademicProgress;
  lastModified: string;
}

export type ReportJourneyStepState = 'done' | 'current' | 'upcoming';

export interface ReportJourneyStep {
  id: string;
  labelKey: string;
  state: ReportJourneyStepState;
  date?: string;
}

export type ReportActivityType = 'edit' | 'comment' | 'submit' | 'version' | 'reference' | 'feedback';

export interface ReportActivityItem {
  id: string;
  type: ReportActivityType;
  title: string;
  description: string;
  time: string;
  reportId?: string;
}

export interface HubSupervisorFeedbackItem {
  id: string;
  author: string;
  text: string;
  section: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  resolved: boolean;
}

export interface HubDocumentItem {
  id: string;
  name: string;
  type: 'reference' | 'attachment' | 'template' | 'bibliography';
  meta: string;
  updatedAt: string;
}

export interface HubKpiMetrics {
  wordCount: number;
  targetWords: number;
  completion: number;
  sectionsComplete: number;
  totalSections: number;
  references: number;
  pendingFeedback: number;
  readingMinutes: number;
}
