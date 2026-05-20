import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';
import type {
  AnnouncementDashboardData,
  AnnouncementDetailResponse,
  AnnouncementListItem,
  AnnouncementListParams,
  AnnouncementTypeItem,
  AnnouncementWritePayload,
  PaginatedAnnouncements,
} from '../announcements-stage/types/announcement';

const BASE = '/admin/announcements';

function buildListParams(params?: AnnouncementListParams): Record<string, string | number | boolean> {
  if (!params) return {};
  const out: Record<string, string | number | boolean> = {};
  const keys: (keyof AnnouncementListParams)[] = [
    'page', 'page_size', 'search', 'status', 'priority', 'type', 'internship_only', 'ordering',
  ];
  for (const k of keys) {
    const v = params[k];
    if (v !== undefined && v !== '') out[k] = v as string | number;
  }
  return out;
}

export const adminAnnouncementsApi = {
  dashboard: async (): Promise<AnnouncementDashboardData> => {
    const res = await apiClient.get<ApiEnvelope<AnnouncementDashboardData>>(`${BASE}/dashboard`);
    return res.data.data!;
  },

  list: async (params?: AnnouncementListParams): Promise<PaginatedAnnouncements> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedAnnouncements>>(BASE, {
      params: buildListParams(params),
    });
    return res.data.data ?? { items: [], page: 1, page_size: 15, total: 0, total_pages: 0 };
  },

  detail: async (id: string): Promise<AnnouncementDetailResponse> => {
    const res = await apiClient.get<ApiEnvelope<AnnouncementDetailResponse>>(`${BASE}/${id}`);
    return res.data.data!;
  },

  create: async (payload: AnnouncementWritePayload) => {
    const res = await apiClient.post<ApiEnvelope<AnnouncementListItem>>(BASE, payload);
    return res.data.data!;
  },

  update: async (id: string, payload: Partial<AnnouncementWritePayload>) => {
    const res = await apiClient.patch<ApiEnvelope<unknown>>(`${BASE}/${id}`, payload);
    return res.data.data;
  },

  remove: async (id: string) => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  action: async (id: string, action: string) => {
    const res = await apiClient.post<ApiEnvelope<unknown>>(`${BASE}/${id}/${action}`);
    return res.data.data;
  },

  bulk: async (ids: string[], action: string) => {
    const res = await apiClient.post<ApiEnvelope<unknown>>(`${BASE}/bulk`, { ids, action });
    return res.data.data;
  },

  uploadAttachment: async (id: string, file: File, kind = 'FILE') => {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    const res = await apiClient.post(`${BASE}/${id}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadCover: async (id: string, file: File) => {
    const form = new FormData();
    form.append('cover', file);
    const res = await apiClient.post(`${BASE}/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  types: async (): Promise<AnnouncementTypeItem[]> => {
    const res = await apiClient.get<ApiEnvelope<AnnouncementTypeItem[]>>(`${BASE}/types`);
    return res.data.data ?? [];
  },

  updateType: async (pk: number, payload: Record<string, unknown>) => {
    const res = await apiClient.patch<ApiEnvelope<AnnouncementTypeItem>>(`${BASE}/types/${pk}`, payload);
    return res.data.data!;
  },

  seedTypes: async () => {
    const res = await apiClient.post<ApiEnvelope<unknown>>(`${BASE}/types/seed`);
    return res.data.data;
  },

  analytics: async () => {
    const res = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(`${BASE}/analytics`);
    return res.data.data!;
  },

  insights: async () => {
    const res = await apiClient.get<ApiEnvelope<unknown[]>>(`${BASE}/insights`);
    return res.data.data ?? [];
  },

  engagement: async () => {
    const res = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(`${BASE}/engagement`);
    return res.data.data!;
  },
};
