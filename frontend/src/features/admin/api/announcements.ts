import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';
import type {
  AnnouncementDashboardData,
  AnnouncementDetailResponse,
  AnnouncementListItem,
  AnnouncementListParams,
  AnnouncementTypeItem,
  AnnouncementTypeWritePayload,
  AnnouncementWritePayload,
  PaginatedAnnouncements,
  ScheduledDashboardData,
} from '../announcements-stage/types/announcement';

const BASE = '/admin/announcements';

function buildListParams(params?: AnnouncementListParams): Record<string, string | number | boolean> {
  if (!params) return {};
  const out: Record<string, string | number | boolean> = {};
  const keys: (keyof AnnouncementListParams)[] = [
    'page', 'page_size', 'search', 'status', 'priority', 'type', 'internship_only', 'ordering',
    'scheduled_only', 'date_range', 'publish_start_from', 'publish_start_to',
    'filiere', 'class_group', 'academic_level',
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

  scheduledDashboard: async (): Promise<ScheduledDashboardData> => {
    const res = await apiClient.get<ApiEnvelope<ScheduledDashboardData>>(`${BASE}/scheduled`);
    return res.data.data!;
  },

  list: async (params?: AnnouncementListParams): Promise<PaginatedAnnouncements> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedAnnouncements>>(BASE, {
      params: buildListParams(params),
    });
    return res.data.data ?? { items: [], page: 1, page_size: 15, total: 0, total_pages: 0 };
  },

  emailPreview: async (id: string, language = 'fr') => {
    const res = await apiClient.get<
      ApiEnvelope<{
        subject: string;
        body_html: string;
        body_text: string;
        action_url: string;
        sender_name: string;
        sender_email: string;
        template_code: string;
        language: string;
        has_rich_content: boolean;
        cover_image_url: string | null;
        attachments: {
          id: number;
          label: string;
          originalFilename?: string;
          fileUrl: string | null;
          externalUrl: string | null;
          mimeType: string;
          fileSizeBytes: number;
          kind?: string;
        }[];
      }>
    >(`${BASE}/${id}/email-preview`, { params: { language } });
    return res.data.data!;
  },

  detail: async (id: string): Promise<AnnouncementDetailResponse> => {
    const res = await apiClient.get<ApiEnvelope<AnnouncementDetailResponse | Record<string, unknown>>>(
      `${BASE}/${id}`,
    );
    const payload = res.data.data;
    if (!payload || typeof payload !== 'object') {
      throw new Error('announcement_detail_empty');
    }
    if ('announcement' in payload) {
      return payload as AnnouncementDetailResponse;
    }
    return {
      announcement: payload,
      publicationHistory: [],
      audienceCount: 0,
    };
  },

  create: async (payload: AnnouncementWritePayload) => {
    const res = await apiClient.post<ApiEnvelope<{ id: string; coverImageUrl?: string | null }>>(BASE, payload);
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

  bulkDelete: async (ids: string[]) => {
    const res = await apiClient.post<ApiEnvelope<{ deleted: number }>>(`${BASE}/bulk`, {
      ids,
      action: 'delete',
    });
    if (!res.data.success) {
      throw new Error(res.data.message || 'Bulk delete failed');
    }
    return res.data.data ?? { deleted: ids.length };
  },

  uploadAttachment: async (id: string, file: File, kind = 'FILE') => {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    const res = await apiClient.post(`${BASE}/${id}/attachments`, form);
    return res.data;
  },

  uploadAttachments: async (id: string, files: File[]) => {
    for (const file of files) {
      await adminAnnouncementsApi.uploadAttachment(id, file);
    }
  },

  uploadAttachmentLink: async (id: string, url: string, label?: string) => {
    const res = await apiClient.post(`${BASE}/${id}/attachments`, {
      external_url: url,
      ...(label ? { label } : {}),
    });
    return res.data;
  },

  uploadAttachmentLinks: async (id: string, urls: string[]) => {
    for (const url of urls) {
      await adminAnnouncementsApi.uploadAttachmentLink(id, url);
    }
  },

  uploadCover: async (id: string, file: File) => {
    const form = new FormData();
    form.append('cover', file);
    const res = await apiClient.post(`${BASE}/${id}/cover`, form);
    return res.data.data;
  },

  types: async (includeInactive = false): Promise<AnnouncementTypeItem[]> => {
    const res = await apiClient.get<ApiEnvelope<AnnouncementTypeItem[]>>(`${BASE}/types`, {
      params: includeInactive ? { include_inactive: '1' } : undefined,
    });
    return res.data.data ?? [];
  },

  createType: async (payload: AnnouncementTypeWritePayload) => {
    const res = await apiClient.post<ApiEnvelope<AnnouncementTypeItem>>(`${BASE}/types`, payload);
    return res.data.data!;
  },

  updateType: async (pk: number, payload: Partial<AnnouncementTypeWritePayload>) => {
    const res = await apiClient.patch<ApiEnvelope<AnnouncementTypeItem>>(`${BASE}/types/${pk}`, payload);
    return res.data.data!;
  },

  deleteType: async (pk: number) => {
    const res = await apiClient.delete<ApiEnvelope<AnnouncementTypeItem>>(`${BASE}/types/${pk}`);
    return res.data;
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
