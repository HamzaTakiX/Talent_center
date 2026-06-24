export type NotificationDisplayType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'system'
  | 'action_required';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type NotificationCategory =
  | 'offers'
  | 'applications'
  | 'documents'
  | 'announcements'
  | 'chat'
  | 'srf'
  | 'cv_analysis'
  | 'interview_simulator'
  | 'system'
  | 'supervision';

export type NotificationSection = 'all' | 'unread' | 'read' | 'archived' | 'action_required';

export interface NotificationItem {
  id: number;
  notification_type: string;
  display_type: NotificationDisplayType;
  title: string;
  body: string;
  icon: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  source_module: string;
  requires_action: boolean;
  action_url: string;
  payload_json: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface NotificationFeedResponse {
  items: NotificationItem[];
  total: number;
  limit: number;
  offset: number;
  unread_count: number;
}

export interface NotificationFeedParams {
  section?: NotificationSection;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  module?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationPreference {
  category: NotificationCategory;
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
  is_enabled: boolean;
  frequency: 'REALTIME' | 'DAILY_DIGEST' | 'WEEKLY_DIGEST' | 'MONTHLY_DIGEST' | 'NEVER';
}

export interface NotificationUserStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  action_required: number;
}

export interface NotificationWsEvent {
  event_type: string;
  notification?: NotificationItem;
  notification_id?: number;
  count?: number;
}
