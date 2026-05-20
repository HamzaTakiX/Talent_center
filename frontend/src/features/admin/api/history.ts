import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';

const BASE = '/history';

export type HistoryCriticality = 'INFO' | 'IMPORTANT' | 'CRITICAL' | 'AUTOMATED';

export interface HistoryEventDto {
  id: number;
  occurred_at: string;
  source_app: string;
  action_code: string;
  event_code: string;
  entity_type: string;
  entity_id: number | null;
  summary: string;
  severity: string;
  criticality: HistoryCriticality;
  actor_user: number | null;
  actor_email: string;
  actor_role: string;
  actor_name: string;
  is_automated: boolean;
  visibility_scope: string;
  correlation_id: string | null;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  details: Record<string, unknown>;
  entity_path: string | null;
  metadata_entries?: { key: string; value: string; value_type: string }[];
  targets?: {
    target_entity_type: string;
    target_entity_id: number;
    target_role: string;
    description: string;
    metadata_json: Record<string, unknown>;
  }[];
  payload_json?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string;
}

export interface PaginatedHistoryEvents {
  items: HistoryEventDto[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface HistoryDashboardData {
  summary: {
    total_events: number;
    critical_last_24h: number;
    automated_last_7d: number;
    active_actors_7d: number;
  };
  by_module: { source_app: string; count: number }[];
  by_severity: { severity: string; count: number }[];
  by_action: { action_code: string; count: number }[];
  module_stats: { key: string; value: number }[];
  activity_trend: { date: string; count: number }[];
}

export interface HistoryInsight {
  code: string;
  severity: 'info' | 'warning' | 'critical';
  title_key: string;
  detail_key: string;
  metadata: Record<string, unknown>;
}

export interface HistoryCenterPayload {
  dashboard: HistoryDashboardData;
  timeline: PaginatedHistoryEvents;
}

export interface HistoryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  /** KPI card key — maps to one or more `source_app` values on the backend. */
  kpi?: string;
  module?: string;
  action?: string;
  severity?: string;
  criticality?: string;
  entity_type?: string;
  entity_id?: string | number;
  actor_id?: number;
  role?: string;
  automated?: 'true' | 'false';
  date_from?: string;
  date_to?: string;
}

function buildParams(params?: HistoryListParams): Record<string, string | number> {
  if (!params) return {};
  const out: Record<string, string | number> = {};
  const keys: (keyof HistoryListParams)[] = [
    'page', 'page_size', 'search', 'kpi', 'module', 'action', 'severity', 'criticality',
    'entity_type', 'entity_id', 'actor_id', 'role', 'automated', 'date_from', 'date_to',
  ];
  for (const k of keys) {
    const v = params[k];
    if (v !== undefined && v !== '') out[k] = v as string | number;
  }
  return out;
}

export const adminHistoryApi = {
  center: async (params?: HistoryListParams): Promise<HistoryCenterPayload> => {
    const res = await apiClient.get<ApiEnvelope<HistoryCenterPayload>>(`${BASE}/center`, {
      params: buildParams(params),
    });
    return res.data.data!;
  },

  list: async (params?: HistoryListParams): Promise<PaginatedHistoryEvents> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedHistoryEvents>>(`${BASE}/events`, {
      params: buildParams(params),
    });
    return res.data.data ?? { items: [], page: 1, page_size: 25, total: 0, total_pages: 0 };
  },

  detail: async (id: number): Promise<HistoryEventDto> => {
    const res = await apiClient.get<ApiEnvelope<HistoryEventDto>>(`${BASE}/events/${id}`);
    return res.data.data!;
  },

  entityTimeline: async (
    entityType: string,
    entityId: number,
    params?: Pick<HistoryListParams, 'page' | 'page_size'>,
  ): Promise<PaginatedHistoryEvents> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedHistoryEvents>>(
      `${BASE}/entity/${entityType}/${entityId}`,
      { params: buildParams(params) },
    );
    return res.data.data ?? { items: [], page: 1, page_size: 25, total: 0, total_pages: 0 };
  },

  dashboard: async (): Promise<HistoryDashboardData> => {
    const res = await apiClient.get<ApiEnvelope<HistoryDashboardData>>(`${BASE}/dashboard`);
    return res.data.data!;
  },

  insights: async (): Promise<HistoryInsight[]> => {
    const res = await apiClient.get<ApiEnvelope<{ items: HistoryInsight[] }>>(`${BASE}/insights`);
    return res.data.data?.items ?? [];
  },

  exportCsv: async (filters: Record<string, unknown>) => {
    const res = await apiClient.post<ApiEnvelope<{ uuid: string; download_url: string | null }>>(
      `${BASE}/exports`,
      { export_type: 'CSV', filters },
    );
    return res.data.data!;
  },
};
