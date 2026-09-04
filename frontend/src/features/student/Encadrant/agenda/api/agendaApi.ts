/**
 * Calendar API client.
 *
 * Talks to `/api/agenda/*` and maps the backend's snake_case envelope payloads
 * onto the camelCase view model the components use. Every authorization
 * decision lives on the server — this layer only shapes data.
 */

import apiClient from '../../../../../shared/api/client';
import type {
  AgendaAvailabilityException,
  AgendaAvailabilityRule,
  AgendaConflictReport,
  AgendaEventInput,
  AgendaInterval,
  AgendaMetadata,
  AgendaParticipant,
  AgendaPerson,
  AgendaPlatformEvent,
  AgendaSeriesScope,
  AgendaUserFreeBusy,
} from '../types';

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RangePayload {
  items: RawEvent[];
  total: number;
  range: { start: string; end: string };
}

interface PagePayload {
  items: RawEvent[];
  total: number;
  page: number;
  total_pages: number;
}

interface RawPerson {
  user_id: number;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface RawParticipant extends RawPerson {
  role: string;
  response: string;
  responded_at: string | null;
  is_organizer: boolean;
}

interface RawEvent {
  id: string;
  occurrence_id: string;
  occurrence_start: string;
  title: string;
  description: string;
  type: string;
  event_type: string;
  status: string;
  event_status: string;
  priority: string;
  visibility: string;
  source: string;
  start: string;
  end: string;
  timezone: string;
  all_day: boolean;
  location: string;
  is_online: boolean;
  external_meeting_url: string;
  organizer: RawPerson | null;
  participants: RawParticipant[];
  participant_count: number;
  related_student: Record<string, unknown> | null;
  related_encadrant: Record<string, unknown> | null;
  related_internship: Record<string, unknown> | null;
  conversation_id: number | null;
  video_meeting: Record<string, unknown> | null;
  is_recurring: boolean;
  is_recurring_instance: boolean;
  recurrence: Record<string, unknown> | null;
  series_id: string | null;
  my_response: string | null;
  can_edit: boolean;
  can_respond: boolean;
  reminders?: { id: number; minutes_before: number; channel: string; user_id: number | null }[];
  created_at: string;
  updated_at: string;
}

const PRIORITY_MAP: Record<string, AgendaPlatformEvent['priority']> = {
  URGENT: 'high',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

function mapPerson(raw: RawPerson | null): AgendaPerson | null {
  if (!raw) return null;
  return {
    userId: raw.user_id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    avatarUrl: raw.avatar_url,
  };
}

function mapParticipant(raw: RawParticipant): AgendaParticipant {
  return {
    userId: raw.user_id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    avatarUrl: raw.avatar_url,
    participantRole: raw.role as AgendaParticipant['participantRole'],
    response: raw.response as AgendaParticipant['response'],
    respondedAt: raw.responded_at,
    isOrganizer: raw.is_organizer,
  };
}

export function mapEvent(raw: RawEvent): AgendaPlatformEvent {
  const meeting = raw.video_meeting as
    | { meeting_id: number; session_id: string; status: string; mode: string; can_join: boolean }
    | null;
  const student = raw.related_student as
    | { student_profile_id: number; user_id: number | null; name: string; student_number: string }
    | null;
  const encadrant = raw.related_encadrant as
    | { encadrant_profile_id: number; user_id: number | null; name: string }
    | null;
  const internship = raw.related_internship as
    | {
        assignment_id: number;
        academic_year: string;
        start_date: string | null;
        end_date: string | null;
        is_active: boolean;
      }
    | null;
  const recurrence = raw.recurrence as
    | {
        frequency: string;
        interval: number;
        by_weekdays: number[];
        by_month_day: number | null;
        until: string | null;
        count: number | null;
      }
    | null;

  return {
    id: raw.id,
    occurrenceId: raw.occurrence_id,
    occurrenceStart: raw.occurrence_start,

    title: raw.title,
    description: raw.description,

    category: raw.type as AgendaPlatformEvent['category'],
    eventType: raw.event_type as AgendaPlatformEvent['eventType'],
    status: raw.status as AgendaPlatformEvent['status'],
    priority: PRIORITY_MAP[raw.priority],
    visibility: raw.visibility as AgendaPlatformEvent['visibility'],
    source: raw.source,

    startAt: raw.start,
    endAt: raw.end,
    timezone: raw.timezone,
    allDay: raw.all_day,
    location: raw.location,

    isOnline: raw.is_online,
    externalMeetingUrl: raw.external_meeting_url,

    organizer: mapPerson(raw.organizer),
    organizerName: raw.organizer?.name ?? '',
    participants: (raw.participants ?? []).map(mapParticipant),
    participantCount: raw.participant_count,

    relatedStudent: student
      ? {
          studentProfileId: student.student_profile_id,
          userId: student.user_id,
          name: student.name,
          studentNumber: student.student_number,
        }
      : null,
    relatedEncadrant: encadrant
      ? {
          encadrantProfileId: encadrant.encadrant_profile_id,
          userId: encadrant.user_id,
          name: encadrant.name,
        }
      : null,
    relatedInternship: internship
      ? {
          assignmentId: internship.assignment_id,
          academicYear: internship.academic_year,
          startDate: internship.start_date,
          endDate: internship.end_date,
          isActive: internship.is_active,
        }
      : null,
    conversationId: raw.conversation_id,

    videoMeeting: meeting
      ? {
          meetingId: meeting.meeting_id,
          sessionId: meeting.session_id,
          status: meeting.status,
          mode: meeting.mode,
          canJoin: meeting.can_join,
        }
      : null,
    showJoin: Boolean(meeting?.can_join),
    meetingId: meeting?.meeting_id,

    isRecurring: raw.is_recurring,
    isRecurringInstance: raw.is_recurring_instance,
    recurrence: recurrence
      ? {
          frequency: recurrence.frequency as never,
          interval: recurrence.interval,
          byWeekdays: recurrence.by_weekdays ?? [],
          byMonthDay: recurrence.by_month_day,
          until: recurrence.until,
          count: recurrence.count,
        }
      : null,
    seriesId: raw.series_id,

    myResponse: raw.my_response as AgendaPlatformEvent['myResponse'],
    canEdit: raw.can_edit,
    canRespond: raw.can_respond,

    reminders: raw.reminders?.map((r) => ({
      id: r.id,
      minutesBefore: r.minutes_before,
      channel: r.channel as never,
      userId: r.user_id,
    })),

    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/** Drops undefined keys so a partial update never clears a field by accident. */
function toEventBody(input: AgendaEventInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const put = (key: string, value: unknown) => {
    if (value !== undefined) body[key] = value;
  };

  put('title', input.title);
  put('description', input.description);
  put('event_type', input.eventType);
  put('start', input.start);
  put('end', input.end);
  put('timezone', input.timezone);
  put('all_day', input.allDay);
  put('location', input.location);
  put('is_online', input.isOnline);
  put('visibility', input.visibility);
  put('participant_user_ids', input.participantUserIds);
  put('related_student_id', input.relatedStudentId);
  put('related_encadrant_id', input.relatedEncadrantId);
  put('related_assignment_id', input.relatedAssignmentId);
  put('attach_conversation', input.attachConversation);
  put('allow_conflicts', input.allowConflicts);
  put('scope', input.scope);
  put('occurrence_start', input.occurrenceStart);

  if (input.reminders !== undefined) {
    body.reminders = input.reminders.map((r) => ({
      minutes_before: r.minutesBefore,
      channel: r.channel ?? 'IN_APP',
    }));
  }
  if (input.recurrence !== undefined) {
    body.recurrence = input.recurrence
      ? {
          frequency: input.recurrence.frequency,
          interval: input.recurrence.interval ?? 1,
          by_weekdays: input.recurrence.byWeekdays ?? [],
          by_month_day: input.recurrence.byMonthDay ?? null,
          until: input.recurrence.until ?? null,
          count: input.recurrence.count ?? null,
        }
      : null;
  }
  return body;
}

function mapIntervals(raw: { start: string; end: string }[]): AgendaInterval[] {
  return (raw ?? []).map((i) => ({ start: i.start, end: i.end }));
}

export interface AgendaListFilters {
  types?: string[];
  q?: string;
  student?: number;
  encadrant?: number;
  internship?: number;
  participant?: number;
  mine?: boolean;
  includeCancelled?: boolean;
  sort?: string;
}

function toFilterParams(filters: AgendaListFilters = {}): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.types?.length) params.type = filters.types.join(',');
  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.student) params.student = String(filters.student);
  if (filters.encadrant) params.encadrant = String(filters.encadrant);
  if (filters.internship) params.internship = String(filters.internship);
  if (filters.participant) params.participant = String(filters.participant);
  if (filters.mine) params.mine = 'true';
  if (filters.includeCancelled) params.include_cancelled = 'true';
  if (filters.sort) params.sort = filters.sort;
  return params;
}

export const agendaApi = {
  /** One range call serves the day, week and month grids. */
  listRange: async (
    start: Date,
    end: Date,
    filters?: AgendaListFilters,
    signal?: AbortSignal,
  ): Promise<{ events: AgendaPlatformEvent[]; range: { start: string; end: string } }> => {
    const response = await apiClient.get<Envelope<RangePayload>>('/agenda/events', {
      params: { start: start.toISOString(), end: end.toISOString(), ...toFilterParams(filters) },
      signal,
    });
    return {
      events: response.data.data.items.map(mapEvent),
      range: response.data.data.range,
    };
  },

  /** Flat paginated mode, used by the search panel. */
  search: async (
    filters: AgendaListFilters,
    page = 1,
    pageSize = 25,
    signal?: AbortSignal,
  ): Promise<{ events: AgendaPlatformEvent[]; total: number; totalPages: number }> => {
    const response = await apiClient.get<Envelope<PagePayload>>('/agenda/events', {
      params: { ...toFilterParams(filters), page, page_size: pageSize },
      signal,
    });
    return {
      events: response.data.data.items.map(mapEvent),
      total: response.data.data.total,
      totalPages: response.data.data.total_pages,
    };
  },

  get: async (eventId: string): Promise<AgendaPlatformEvent> => {
    const response = await apiClient.get<Envelope<RawEvent>>(`/agenda/events/${eventId}`);
    return mapEvent(response.data.data);
  },

  create: async (input: AgendaEventInput): Promise<AgendaPlatformEvent> => {
    const response = await apiClient.post<Envelope<RawEvent>>('/agenda/events', toEventBody(input));
    return mapEvent(response.data.data);
  },

  update: async (eventId: string, input: AgendaEventInput): Promise<AgendaPlatformEvent> => {
    const response = await apiClient.patch<Envelope<RawEvent>>(
      `/agenda/events/${eventId}`,
      toEventBody(input),
    );
    return mapEvent(response.data.data);
  },

  /** Drag-and-drop and resize. */
  move: async (
    eventId: string,
    payload: {
      start?: string;
      end?: string;
      deltaDays?: number;
      scope?: AgendaSeriesScope;
      occurrenceStart?: string;
      allowConflicts?: boolean;
    },
  ): Promise<AgendaPlatformEvent> => {
    const body: Record<string, unknown> = {};
    if (payload.start !== undefined) body.start = payload.start;
    if (payload.end !== undefined) body.end = payload.end;
    if (payload.deltaDays !== undefined) body.delta_days = payload.deltaDays;
    if (payload.scope) body.scope = payload.scope;
    if (payload.occurrenceStart) body.occurrence_start = payload.occurrenceStart;
    if (payload.allowConflicts) body.allow_conflicts = true;

    const response = await apiClient.post<Envelope<RawEvent>>(
      `/agenda/events/${eventId}/move`,
      body,
    );
    return mapEvent(response.data.data);
  },

  remove: async (
    eventId: string,
    options: { scope?: AgendaSeriesScope; occurrenceStart?: string; cancel?: boolean } = {},
  ): Promise<void> => {
    const params: Record<string, string> = {};
    if (options.scope) params.scope = options.scope;
    if (options.occurrenceStart) params.occurrence_start = options.occurrenceStart;
    if (options.cancel) params.mode = 'cancel';
    await apiClient.delete(`/agenda/events/${eventId}`, { params });
  },

  addParticipants: async (eventId: string, userIds: number[]): Promise<AgendaPlatformEvent> => {
    const response = await apiClient.post<Envelope<RawEvent>>(
      `/agenda/events/${eventId}/participants`,
      { user_ids: userIds },
    );
    return mapEvent(response.data.data);
  },

  removeParticipant: async (eventId: string, userId: number): Promise<AgendaPlatformEvent> => {
    const response = await apiClient.delete<Envelope<RawEvent>>(
      `/agenda/events/${eventId}/participants`,
      { params: { user_id: userId } },
    );
    return mapEvent(response.data.data);
  },

  respond: async (
    eventId: string,
    value: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE',
  ): Promise<AgendaPlatformEvent> => {
    const response = await apiClient.post<Envelope<RawEvent>>(
      `/agenda/events/${eventId}/respond`,
      { response: value },
    );
    return mapEvent(response.data.data);
  },

  /** Room credentials, issued only after the backend re-checks meeting access. */
  join: async (eventId: string): Promise<{ session_id: string; jitsi_room_name: string }> => {
    const response = await apiClient.post<Envelope<{ session_id: string; jitsi_room_name: string }>>(
      `/agenda/events/${eventId}/join`,
    );
    return response.data.data;
  },

  checkConflicts: async (payload: {
    start: string;
    end: string;
    timezone?: string;
    participantUserIds?: number[];
    excludeEventId?: string;
  }): Promise<AgendaConflictReport> => {
    const response = await apiClient.post<
      Envelope<{
        has_conflicts: boolean;
        has_blocking_conflicts: boolean;
        conflicts: {
          user_id: number;
          event_id: string;
          title: string;
          event_type: string;
          start: string;
          end: string;
          blocking: boolean;
        }[];
      }>
    >('/agenda/conflicts', {
      start: payload.start,
      end: payload.end,
      timezone: payload.timezone,
      participant_user_ids: payload.participantUserIds ?? [],
      exclude_event_id: payload.excludeEventId,
    });
    const data = response.data.data;
    return {
      hasConflicts: data.has_conflicts,
      hasBlockingConflicts: data.has_blocking_conflicts,
      conflicts: data.conflicts.map((c) => ({
        userId: c.user_id,
        eventId: c.event_id,
        title: c.title,
        eventType: c.event_type as never,
        start: c.start,
        end: c.end,
        blocking: c.blocking,
      })),
    };
  },

  /** Exactly the people the caller is allowed to invite. */
  contacts: async (query?: string): Promise<AgendaPerson[]> => {
    const response = await apiClient.get<Envelope<{ items: RawPerson[] }>>('/agenda/contacts', {
      params: query ? { q: query } : undefined,
    });
    return response.data.data.items.map((p) => mapPerson(p) as AgendaPerson);
  },

  metadata: async (): Promise<AgendaMetadata> => {
    const response = await apiClient.get<
      Envelope<{
        event_types: { value: string; ui: string; label: string }[];
        statuses: { value: string; label: string }[];
        visibilities: { value: string; label: string }[];
        reminder_presets: number[];
        role: string;
        default_timezone: string;
      }>
    >('/agenda/meta');
    const data = response.data.data;
    return {
      eventTypes: data.event_types as never,
      statuses: data.statuses,
      visibilities: data.visibilities as never,
      reminderPresets: data.reminder_presets,
      role: data.role,
      defaultTimezone: data.default_timezone,
    };
  },

  getAvailability: async (): Promise<{
    rules: AgendaAvailabilityRule[];
    exceptions: AgendaAvailabilityException[];
  }> => {
    const response = await apiClient.get<
      Envelope<{
        rules: {
          id: number;
          weekday: number;
          start_time: string;
          end_time: string;
          timezone: string;
          is_active: boolean;
        }[];
        exceptions: {
          id: number;
          start: string;
          end: string;
          is_available: boolean;
          reason: string;
        }[];
      }>
    >('/agenda/availability');
    const data = response.data.data;
    return {
      rules: data.rules.map((r) => ({
        id: r.id,
        weekday: r.weekday,
        startTime: r.start_time,
        endTime: r.end_time,
        timezone: r.timezone,
        isActive: r.is_active,
      })),
      exceptions: data.exceptions.map((e) => ({
        id: e.id,
        start: e.start,
        end: e.end,
        isAvailable: e.is_available,
        reason: e.reason,
      })),
    };
  },

  saveAvailability: async (
    rules: { weekday: number; startTime: string; endTime: string; timezone?: string }[],
  ): Promise<void> => {
    await apiClient.put('/agenda/availability', {
      rules: rules.map((r) => ({
        weekday: r.weekday,
        start_time: r.startTime,
        end_time: r.endTime,
        timezone: r.timezone,
      })),
    });
  },

  addAvailabilityException: async (payload: {
    start: string;
    end: string;
    reason?: string;
    isAvailable?: boolean;
  }): Promise<void> => {
    await apiClient.post('/agenda/availability/exceptions', {
      start: payload.start,
      end: payload.end,
      reason: payload.reason ?? '',
      is_available: payload.isAvailable ?? false,
    });
  },

  removeAvailabilityException: async (exceptionId: number): Promise<void> => {
    await apiClient.delete(`/agenda/availability/exceptions/${exceptionId}`);
  },

  freeBusy: async (
    start: Date,
    end: Date,
    userIds: number[] = [],
  ): Promise<AgendaUserFreeBusy[]> => {
    const response = await apiClient.get<
      Envelope<{
        users: {
          user_id: number;
          working: { start: string; end: string }[];
          busy: { start: string; end: string }[];
          free: { start: string; end: string }[];
        }[];
      }>
    >('/agenda/availability/free-busy', {
      params: {
        start: start.toISOString(),
        end: end.toISOString(),
        users: userIds.join(','),
      },
    });
    return response.data.data.users.map((u) => ({
      userId: u.user_id,
      working: mapIntervals(u.working),
      busy: mapIntervals(u.busy),
      free: mapIntervals(u.free),
    }));
  },

  suggestedSlots: async (payload: {
    start: Date;
    end: Date;
    userIds?: number[];
    durationMinutes?: number;
    limit?: number;
  }): Promise<AgendaInterval[]> => {
    const response = await apiClient.get<Envelope<{ slots: { start: string; end: string }[] }>>(
      '/agenda/availability/slots',
      {
        params: {
          start: payload.start.toISOString(),
          end: payload.end.toISOString(),
          users: (payload.userIds ?? []).join(','),
          duration_minutes: payload.durationMinutes ?? 30,
          limit: payload.limit ?? 12,
        },
      },
    );
    return mapIntervals(response.data.data.slots);
  },
};

export default agendaApi;
