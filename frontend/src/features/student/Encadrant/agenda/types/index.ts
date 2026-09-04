export type AgendaCalendarView = 'month' | 'week' | 'day' | 'timeline';

/**
 * UI vocabulary for event types.
 *
 * Mirrors `UI_TYPE` in `apps/agenda/serializers.py`; the backend sends this
 * lowercase form alongside its own `event_type` enum so the UI never has to
 * know the internal names.
 */
export type AgendaEventCategory =
  | 'meeting'
  | 'deadline'
  | 'evaluation'
  | 'milestone'
  | 'admin'
  | 'financial'
  | 'reminder'
  | 'out_of_office'
  | 'other';

export type AgendaEventStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type AgendaEventPriority = 'high' | 'medium' | 'low';

/** Backend enum values, posted back verbatim on create/update. */
export type AgendaEventType =
  | 'MEETING'
  | 'DEADLINE'
  | 'EVALUATION'
  | 'MILESTONE'
  | 'ADMINISTRATIVE'
  | 'FINANCE'
  | 'REMINDER'
  | 'OUT_OF_OFFICE'
  | 'OTHER';

export type AgendaVisibility = 'PRIVATE' | 'PARTICIPANTS' | 'SUPERVISION';

export type AgendaInvitationResponse = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';

export type AgendaParticipantRole = 'ORGANIZER' | 'REQUIRED' | 'OPTIONAL';

/** Which occurrences of a recurring series an edit applies to. */
export type AgendaSeriesScope = 'this' | 'following' | 'series';

export type AgendaRecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type AgendaReminderChannel = 'IN_APP' | 'EMAIL';

export type AgendaTaskStatus = 'todo' | 'in_progress' | 'completed';

export type AgendaMeetingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export type AgendaTimelineStepStatus = 'completed' | 'current' | 'upcoming';

export interface AgendaPerson {
  userId: number;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface AgendaParticipant extends AgendaPerson {
  participantRole: AgendaParticipantRole;
  response: AgendaInvitationResponse;
  respondedAt: string | null;
  isOrganizer: boolean;
}

/**
 * Non-sensitive descriptor of the linked video meeting.
 *
 * The Jitsi room name is deliberately absent — it is only issued by the join
 * endpoint, after the backend has authorized the caller for that meeting.
 */
export interface AgendaVideoMeeting {
  meetingId: number;
  sessionId: string;
  status: string;
  mode: string;
  canJoin: boolean;
}

export interface AgendaRelatedStudent {
  studentProfileId: number;
  userId: number | null;
  name: string;
  studentNumber: string;
}

export interface AgendaRelatedEncadrant {
  encadrantProfileId: number;
  userId: number | null;
  name: string;
}

export interface AgendaRelatedInternship {
  assignmentId: number;
  academicYear: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export interface AgendaRecurrence {
  frequency: AgendaRecurrenceFrequency;
  interval: number;
  byWeekdays: number[];
  byMonthDay: number | null;
  until: string | null;
  count: number | null;
}

export interface AgendaReminder {
  id: number;
  minutesBefore: number;
  channel: AgendaReminderChannel;
  userId: number | null;
}

/**
 * One rendered occurrence.
 *
 * For a recurring series every occurrence shares `id` (the series) but has its
 * own `occurrenceId` / `occurrenceStart`, which is what per-occurrence edits
 * post back.
 */
export interface AgendaPlatformEvent {
  id: string;
  occurrenceId: string;
  occurrenceStart: string;

  title: string;
  description: string;

  category: AgendaEventCategory;
  eventType: AgendaEventType;
  status: AgendaEventStatus;
  priority?: AgendaEventPriority;
  visibility: AgendaVisibility;
  source: string;

  startAt: string;
  endAt: string;
  timezone: string;
  allDay: boolean;
  location: string;

  isOnline: boolean;
  externalMeetingUrl: string;

  organizer: AgendaPerson | null;
  organizerName: string;
  participants: AgendaParticipant[];
  participantCount: number;

  relatedStudent: AgendaRelatedStudent | null;
  relatedEncadrant: AgendaRelatedEncadrant | null;
  relatedInternship: AgendaRelatedInternship | null;
  conversationId: number | null;

  videoMeeting: AgendaVideoMeeting | null;
  /** Convenience flags for the shared meeting-join button. */
  showJoin: boolean;
  meetingId?: number;

  isRecurring: boolean;
  isRecurringInstance: boolean;
  recurrence: AgendaRecurrence | null;
  seriesId: string | null;

  myResponse: AgendaInvitationResponse | null;
  canEdit: boolean;
  canRespond: boolean;

  reminders?: AgendaReminder[];

  createdAt: string;
  updatedAt: string;
}

export interface AgendaConflict {
  userId: number;
  eventId: string;
  title: string;
  eventType: AgendaEventType;
  start: string;
  end: string;
  blocking: boolean;
}

export interface AgendaConflictReport {
  hasConflicts: boolean;
  hasBlockingConflicts: boolean;
  conflicts: AgendaConflict[];
}

export interface AgendaInterval {
  start: string;
  end: string;
}

export interface AgendaUserFreeBusy {
  userId: number;
  working: AgendaInterval[];
  busy: AgendaInterval[];
  free: AgendaInterval[];
}

export interface AgendaAvailabilityRule {
  id: number;
  weekday: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

export interface AgendaAvailabilityException {
  id: number;
  start: string;
  end: string;
  isAvailable: boolean;
  reason: string;
}

export interface AgendaMetadata {
  eventTypes: { value: AgendaEventType; ui: AgendaEventCategory; label: string }[];
  statuses: { value: string; label: string }[];
  visibilities: { value: AgendaVisibility; label: string }[];
  reminderPresets: number[];
  role: string;
  defaultTimezone: string;
}

/** Body accepted by create and update. Every field is optional on update. */
export interface AgendaEventInput {
  title?: string;
  description?: string;
  eventType?: AgendaEventType;
  start?: string;
  end?: string;
  timezone?: string;
  allDay?: boolean;
  location?: string;
  isOnline?: boolean;
  visibility?: AgendaVisibility;
  participantUserIds?: number[];
  relatedStudentId?: number | null;
  relatedEncadrantId?: number | null;
  relatedAssignmentId?: number | null;
  reminders?: { minutesBefore: number; channel?: AgendaReminderChannel }[];
  recurrence?: {
    frequency: AgendaRecurrenceFrequency;
    interval?: number;
    byWeekdays?: number[];
    byMonthDay?: number | null;
    until?: string | null;
    count?: number | null;
  } | null;
  attachConversation?: boolean;
  allowConflicts?: boolean;
  scope?: AgendaSeriesScope;
  occurrenceStart?: string;
}

/** Realtime frame pushed on /ws/agenda/ — an invalidation hint, not event data. */
export interface AgendaRealtimeEvent {
  action: string;
  event_id: string;
  start: string;
  end: string;
  scope?: string;
  occurrence_start?: string;
}

export interface AgendaStatCard {
  id: string;
  value: string;
  trend: number;
  iconKey: 'meetings' | 'tasks' | 'deadlines' | 'completed';
}

export interface AgendaAssignedTask {
  id: string;
  titleKey: string;
  dueAt: string;
  priority: AgendaEventPriority;
  status: AgendaTaskStatus;
}

export interface AgendaDeadlineItem {
  id: string;
  titleKey: string;
  dueAt: string;
  daysRemaining: number;
  progress: number;
  priority: AgendaEventPriority;
  category: 'report' | 'document' | 'evaluation' | 'admin';
}

export interface AgendaSupervisorMeeting {
  id: string;
  subjectKey: string;
  date: string;
  time: string;
  status: AgendaMeetingStatus;
  meetingTypeKey: string;
  meetingId?: number;
}

export interface AgendaProgressMetric {
  id: string;
  labelKey: string;
  progress: number;
}

export interface AgendaNotification {
  id: string;
  messageKey: string;
  timeKey: string;
  type: 'meeting' | 'deadline' | 'message' | 'evaluation';
}

export interface AgendaTimelineStep {
  id: string;
  labelKey: string;
  status: AgendaTimelineStepStatus;
  dateKey?: string;
}

export interface AgendaExportAction {
  id: string;
  labelKey: string;
  iconKey: 'pdf' | 'excel' | 'ics' | 'google' | 'outlook';
}
