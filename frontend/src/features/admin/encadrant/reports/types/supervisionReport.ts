/** ERMS supervision report types (admin API). */

export type SupervisionReportPresentationStatus =
  | 'Submitted'
  | 'Pending'
  | 'Approved'
  | 'Overdue';

export type SupervisionReportSeverity =
  | 'INFO'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type SupervisionReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REQUIRES_CHANGES'
  | 'RESUBMITTED'
  | 'ESCALATED'
  | 'CRITICAL_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'REVIEWED';

export type SupervisionReportQueue =
  | 'all'
  | 'critical'
  | 'overdue'
  | 'pending_validation'
  | 'risk_alerts'
  | 'in_progress'
  | 'pending'
  | 'approved';

export interface SupervisionReportListItem {
  id: string;
  title: string;
  reportType: string;
  reportTypeLabel: string;
  status: SupervisionReportStatus;
  presentationStatus: SupervisionReportPresentationStatus;
  severity: SupervisionReportSeverity;
  priorityScore: number;
  isOverdue: boolean;
  score: number | null;
  encadrant: string;
  encadrantId: number;
  student: string;
  studentId: number;
  companyName: string;
  submittedDate: string;
  dueDate: string;
  filiere: string;
  academicYear: string;
  internshipType: { code: string; label: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Row shape used by existing table components (compat). */
export interface EncadrantReportRow {
  id: string;
  encadrant: string;
  student: string;
  reportType: string;
  status: SupervisionReportPresentationStatus;
  submittedDate: string;
  dueDate: string;
  severity?: SupervisionReportSeverity;
  priorityScore?: number;
  title?: string;
}

export function toTableRow(item: SupervisionReportListItem): EncadrantReportRow {
  return {
    id: item.id,
    encadrant: item.encadrant,
    student: item.student,
    reportType: item.reportTypeLabel || item.reportType,
    status: item.presentationStatus,
    submittedDate: item.submittedDate,
    dueDate: item.dueDate,
    severity: item.severity,
    priorityScore: item.priorityScore,
    title: item.title,
  };
}

export interface SupervisionReportDashboardSummary {
  total: number;
  submitted: number;
  under_review: number;
  approved: number;
  overdue: number;
  critical: number;
  risk_alerts: number;
  pending_validation: number;
}

export interface SupervisionReportTimelineEvent {
  id: number;
  action: string;
  fromStatus: string;
  toStatus: string;
  note: string;
  actor: string;
  createdAt: string;
}

export interface SupervisionReportDetail extends SupervisionReportListItem {
  comments: string;
  evaluationJson: Record<string, unknown>;
  metadataJson: Record<string, unknown>;
  periodStart: string | null;
  periodEnd: string | null;
  internshipPeriodStart: string | null;
  internshipPeriodEnd: string | null;
  companyCity: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  assignedReviewer: string | null;
  assignedReviewerId: number | null;
  studentSummary: {
    id: number;
    displayName: string;
    email: string;
    studentNumber: string;
    filiere: string | null;
    level: string | null;
    sector: string | null;
    classGroup: string | null;
  };
  encadrantSummary: {
    id: number;
    displayName: string;
    email: string;
  };
  attachments: Array<{
    id: number;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    url: string | null;
  }>;
  timeline: SupervisionReportTimelineEvent[];
  adminNotes: Array<{
    id: number;
    body: string;
    author: string;
    isInternal: boolean;
    createdAt: string;
  }>;
  versions: Array<{
    versionNumber: number;
    changeNote: string;
    createdAt: string;
  }>;
}

export interface SupervisionReportListParams {
  page?: number;
  page_size?: number;
  queue?: SupervisionReportQueue;
  search?: string;
  report_type?: string;
  status?: string;
  severity?: string;
  filiere_id?: number;
  encadrant_id?: number;
  academic_year?: string;
  ordering?: string;
}

export interface SupervisionReportListResponse {
  items: SupervisionReportListItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
