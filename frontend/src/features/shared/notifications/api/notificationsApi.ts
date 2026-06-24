import apiClient from '../../../../shared/api/client';
import type { ApiEnvelope } from '../../../admin/api/types';
import type {
  NotificationFeedParams,
  NotificationFeedResponse,
  NotificationItem,
  NotificationPreference,
  NotificationUserStats,
} from '../types';

const BASE = '/notifications';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message || 'Notification API error');
  }
  return envelope.data;
}

export async function fetchNotificationFeed(params: NotificationFeedParams = {}) {
  const { data } = await apiClient.get<ApiEnvelope<NotificationFeedResponse>>(`${BASE}/feed/`, { params });
  return unwrap(data);
}

export async function fetchUnreadCount() {
  const { data } = await apiClient.get<ApiEnvelope<{ count: number }>>(`${BASE}/feed/unread-count/`);
  return unwrap(data).count;
}

export async function fetchNotificationStats() {
  const { data } = await apiClient.get<ApiEnvelope<NotificationUserStats>>(`${BASE}/stats/`);
  return unwrap(data);
}

export async function markNotificationRead(id: number) {
  const { data } = await apiClient.patch<ApiEnvelope<NotificationItem>>(`${BASE}/feed/${id}/read/`);
  return unwrap(data);
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.patch<ApiEnvelope<{ updated: number }>>(`${BASE}/feed/read-all/`);
  return unwrap(data);
}

export async function archiveNotification(id: number) {
  const { data } = await apiClient.patch<ApiEnvelope<NotificationItem>>(`${BASE}/feed/${id}/archive/`);
  return unwrap(data);
}

export async function clickNotification(id: number) {
  const { data } = await apiClient.post<ApiEnvelope<{ action_url: string }>>(`${BASE}/feed/${id}/click/`);
  return unwrap(data);
}

export async function fetchNotificationPreferences() {
  const { data } = await apiClient.get<ApiEnvelope<{ items: NotificationPreference[] }>>(`${BASE}/preferences/`);
  return unwrap(data).items;
}

export async function updateNotificationPreferences(items: NotificationPreference[]) {
  const { data } = await apiClient.put<ApiEnvelope<{ items: NotificationPreference[] }>>(
    `${BASE}/preferences/`,
    items,
  );
  return unwrap(data).items;
}

export async function fetchNotificationCategories() {
  const { data } = await apiClient.get<
    ApiEnvelope<{ categories: { value: string; label: string }[]; priorities: { value: string; label: string }[] }>
  >(`${BASE}/preferences/categories/`);
  return unwrap(data);
}
