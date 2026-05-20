import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';
import type {
  EncadrantMeetingOverview,
  MeetingAlert,
  MeetingsDashboardSummary,
  SupervisionMeetingDetail,
  SupervisionMeetingListParams,
  SupervisionMeetingListResponse,
} from '../encadrant/meetings/types/supervisionMeeting';

const BASE = '/admin/supervision-meetings';

function buildParams(params?: SupervisionMeetingListParams): Record<string, string | number | boolean> {
  if (!params) return {};
  const out: Record<string, string | number | boolean> = {};
  const keys: (keyof SupervisionMeetingListParams)[] = [
    'page', 'page_size', 'search', 'encadrant_id', 'student_id', 'meeting_type', 'status',
    'priority', 'meeting_mode', 'filiere_id', 'academic_level_id', 'class_group_id',
    'internship_type_id', 'academic_year', 'date_from', 'date_to', 'ordering',
  ];
  for (const k of keys) {
    const v = params[k];
    if (v !== undefined && v !== '') out[k] = v as string | number;
  }
  if (params.upcoming) out.upcoming = 'true';
  if (params.overdue) out.overdue = 'true';
  return out;
}

export const adminSupervisionMeetingsApi = {
  dashboard: async () => {
    const response = await apiClient.get<
      ApiEnvelope<{
        summary: MeetingsDashboardSummary;
        alerts: MeetingAlert[];
        encadrantOverview: EncadrantMeetingOverview[];
      }>
    >(`${BASE}/dashboard`);
    return response.data.data!;
  },

  list: async (params?: SupervisionMeetingListParams): Promise<SupervisionMeetingListResponse> => {
    const response = await apiClient.get<ApiEnvelope<SupervisionMeetingListResponse>>(BASE, {
      params: buildParams(params),
    });
    return response.data.data ?? {
      items: [],
      pagination: { page: 1, page_size: 25, total: 0, total_pages: 0 },
    };
  },

  calendar: async (start: string, end: string) => {
    const response = await apiClient.get<
      ApiEnvelope<{ events: unknown[]; conflicts: unknown[] }>
    >(`${BASE}/calendar`, { params: { start, end } });
    return response.data.data ?? { events: [], conflicts: [] };
  },

  analytics: async () => {
    const response = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(`${BASE}/analytics`);
    return response.data.data!;
  },

  detail: async (id: string): Promise<SupervisionMeetingDetail> => {
    const response = await apiClient.get<ApiEnvelope<SupervisionMeetingDetail>>(`${BASE}/${id}`);
    return response.data.data!;
  },

  updateStatus: (id: string, status: string, note?: string) =>
    apiClient.post<ApiEnvelope<SupervisionMeetingDetail>>(`${BASE}/${id}/status`, { status, note }),

  patch: (id: string, payload: Record<string, unknown>) =>
    apiClient.patch<ApiEnvelope<SupervisionMeetingDetail>>(`${BASE}/${id}`, payload),
};
