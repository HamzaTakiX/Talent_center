export type MeetingStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'MISSED'
  | 'NEEDS_FOLLOWUP';

export type MeetingType =
  | 'FOLLOW_UP'
  | 'INTERNSHIP_COACHING'
  | 'PROGRESS_REVIEW'
  | 'MID_TERM_EVAL'
  | 'FINAL_EVAL'
  | 'PROBLEM_RESOLUTION'
  | 'EMERGENCY'
  | 'ORIENTATION'
  | 'ONLINE'
  | 'COMPANY_FOLLOWUP';

export type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda';

export interface SupervisionMeetingListItem {
  id: number;
  title: string;
  meetingType: string;
  status: MeetingStatus;
  priority: string;
  meetingMode: string;
  plannedStart: string | null;
  plannedEnd: string | null;
  location: string;
  meetingUrl: string;
  encadrant: string;
  encadrantId: number;
  student: string;
  studentId: number | null;
  filiere: string;
  filiereId: number | null;
  academicLevel: string;
  classGroup: string;
  academicYear: string;
  internshipType: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface SupervisionMeetingDetail extends SupervisionMeetingListItem {
  description: string;
  notes: string;
  followUpActions: string;
  actualStart: string | null;
  actualEnd: string | null;
  durationMinutes: number;
  assignmentId: number | null;
  workspaceId: number | null;
  reminderSentAt: string | null;
  nextSuggestedAt: string | null;
  createdBy: string;
  updatedAt: string;
  timeline: {
    id: number;
    action: string;
    fromStatus: string;
    toStatus: string;
    note: string;
    actor: string;
    createdAt: string;
  }[];
  attachments: {
    id: number;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    url: string | null;
    uploadedBy: string;
    createdAt: string;
  }[];
  recurrence: {
    frequency: string;
    intervalCount: number;
    untilDate: string | null;
    isActive: boolean;
  } | null;
}

export interface MeetingsDashboardSummary {
  total: number;
  upcoming: number;
  completed: number;
  missed: number;
  delayed: number;
  cancelled: number;
  inProgress: number;
  needsFollowup: number;
  overdue: number;
  completionRate: number;
  cancellationRate: number;
  byStatus: { status: string; count: number }[];
  byType: { meeting_type: string; count: number }[];
}

export interface MeetingAlert {
  code: string;
  severity: string;
  count: number;
  message: string;
}

export interface EncadrantMeetingOverview {
  encadrantId: number;
  encadrantName: string;
  totalMeetings: number;
  completedMeetings: number;
  missedMeetings: number;
  delayedMeetings: number;
  completionRate: number;
  activeStudents: number;
}

export interface SupervisionMeetingListParams {
  page?: number;
  page_size?: number;
  search?: string;
  encadrant_id?: number;
  student_id?: number;
  meeting_type?: string;
  status?: string;
  priority?: string;
  meeting_mode?: string;
  filiere_id?: number;
  academic_level_id?: number;
  class_group_id?: number;
  internship_type_id?: number;
  academic_year?: string;
  date_from?: string;
  date_to?: string;
  upcoming?: boolean;
  overdue?: boolean;
  ordering?: string;
}

export interface SupervisionMeetingListResponse {
  items: SupervisionMeetingListItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
