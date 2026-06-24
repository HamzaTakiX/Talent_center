import apiClient from '../../../../shared/api/client';
import type { ApiEnvelope } from '../../../admin/api/types';
import type { StudentAnnouncementDetailResponse } from '../types';
import type {
  StudentAnnouncementBookmarkResult,
  StudentAnnouncementBookmarkType,
  StudentAnnouncementFeedResponse,
  StudentAnnouncementFeedParams,
  StudentSavedAnnouncementsResponse,
} from '../types';

const BASE = '/student/announcements';

export const studentAnnouncementsApi = {
  feed: async (params?: StudentAnnouncementFeedParams): Promise<StudentAnnouncementFeedResponse> => {
    const res = await apiClient.get<ApiEnvelope<StudentAnnouncementFeedResponse>>(`${BASE}/feed`, {
      params: {
        type: params?.type && params.type !== 'all' ? params.type : undefined,
        priority: params?.priority && params.priority !== 'all' ? params.priority : undefined,
        date: params?.date && params.date !== 'all' ? params.date : undefined,
        search: params?.search || undefined,
        limit: params?.limit,
      },
    });
    return (
      res.data.data ?? {
        items: [],
        recommended: [],
        stats: { total: 0, saved: 0, recent: 0, unread: 0 },
        types: [],
      }
    );
  },

  createChat: async (announcementId: string, message?: string) => {
    const res = await apiClient.post<ApiEnvelope<{ conversation_id: number; announcement_id: string }>>(
      `${BASE}/${announcementId}/chat`,
      message ? { message } : {},
    );
    return res.data.data!;
  },

  saved: async (params?: { search?: string; limit?: number }): Promise<StudentSavedAnnouncementsResponse> => {
    const res = await apiClient.get<ApiEnvelope<StudentSavedAnnouncementsResponse>>(`${BASE}/saved`, {
      params: {
        search: params?.search || undefined,
        limit: params?.limit,
      },
    });
    return res.data.data ?? { items: [], stats: { total: 0 } };
  },

  toggleBookmark: async (
    announcementId: string,
    type: StudentAnnouncementBookmarkType,
  ): Promise<StudentAnnouncementBookmarkResult> => {
    const res = await apiClient.post<ApiEnvelope<StudentAnnouncementBookmarkResult>>(
      `${BASE}/${announcementId}/bookmark`,
      { type },
    );
    return res.data.data!;
  },

  detail: async (announcementId: string): Promise<StudentAnnouncementDetailResponse> => {
    const res = await apiClient.get<ApiEnvelope<StudentAnnouncementDetailResponse>>(`${BASE}/${announcementId}`);
    return res.data.data!;
  },

  recordEngagement: async (
    announcementId: string,
    payload: { action?: 'CLICK'; url?: string; label?: string; source?: 'link' | 'attachment' },
  ): Promise<void> => {
    await apiClient.post(`${BASE}/${announcementId}/engage`, {
      action: payload.action ?? 'CLICK',
      url: payload.url,
      label: payload.label,
      source: payload.source,
    });
  },
};
