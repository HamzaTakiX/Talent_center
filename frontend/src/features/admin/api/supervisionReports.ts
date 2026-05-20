import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';
import type {
  SupervisionReportDashboardSummary,
  SupervisionReportDetail,
  SupervisionReportListParams,
  SupervisionReportListResponse,
} from '../encadrant/reports/types/supervisionReport';

const BASE = '/admin/supervision-reports';

function buildParams(params?: SupervisionReportListParams): Record<string, string | number> {
  if (!params) return {};
  const out: Record<string, string | number> = {};
  if (params.page) out.page = params.page;
  if (params.page_size) out.page_size = params.page_size;
  if (params.queue && params.queue !== 'all') {
    const queueMap: Record<string, string> = {
      critical: 'critical',
      overdue: 'overdue',
      pending_validation: 'pending_validation',
      risk_alerts: 'risk_alerts',
      in_progress: 'all',
      pending: 'all',
      approved: 'all',
    };
    const q = queueMap[params.queue];
    if (q && q !== 'all') out.queue = q;
  }
  if (params.search) out.search = params.search;
  if (params.report_type) out.report_type = params.report_type;
  if (params.status) out.status = params.status;
  if (params.severity) out.severity = params.severity;
  if (params.filiere_id) out.filiere_id = params.filiere_id;
  if (params.encadrant_id) out.encadrant_id = params.encadrant_id;
  if (params.academic_year) out.academic_year = params.academic_year;
  if (params.ordering) out.ordering = params.ordering;
  return out;
}

export const adminSupervisionReportsApi = {
  dashboard: async (academicYear?: string) => {
    const response = await apiClient.get<
      ApiEnvelope<{
        summary: SupervisionReportDashboardSummary;
        analytics: Record<string, unknown>;
      }>
    >(`${BASE}/dashboard`, { params: academicYear ? { academic_year: academicYear } : {} });
    return response.data.data!;
  },

  list: async (params?: SupervisionReportListParams): Promise<SupervisionReportListResponse> => {
    const response = await apiClient.get<ApiEnvelope<SupervisionReportListResponse>>(BASE, {
      params: buildParams(params),
    });
    return response.data.data ?? { items: [], pagination: { page: 1, page_size: 25, total: 0, total_pages: 0 } };
  },

  detail: async (id: string): Promise<SupervisionReportDetail> => {
    const response = await apiClient.get<ApiEnvelope<SupervisionReportDetail>>(`${BASE}/${id}`);
    return response.data.data!;
  },

  analytics: async (academicYear?: string) => {
    const response = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(`${BASE}/analytics`, {
      params: academicYear ? { academic_year: academicYear } : {},
    });
    return response.data.data!;
  },

  approve: (id: string, note?: string) =>
    apiClient.post<ApiEnvelope<SupervisionReportDetail>>(`${BASE}/${id}/approve`, { note }),

  reject: (id: string, note?: string) =>
    apiClient.post<ApiEnvelope<SupervisionReportDetail>>(`${BASE}/${id}/reject`, { note }),

  requestChanges: (id: string, note?: string) =>
    apiClient.post<ApiEnvelope<SupervisionReportDetail>>(`${BASE}/${id}/request-changes`, { note }),

  escalate: (id: string, note?: string) =>
    apiClient.post<ApiEnvelope<SupervisionReportDetail>>(`${BASE}/${id}/escalate`, { note }),

  archive: (id: string, note?: string) =>
    apiClient.post<ApiEnvelope<SupervisionReportDetail>>(`${BASE}/${id}/archive`, { note }),

  addNote: (id: string, body: string) =>
    apiClient.post(`${BASE}/${id}/notes`, { body }),

  notify: (id: string, target: 'encadrant' | 'student' | 'both', message?: string) =>
    apiClient.post(`${BASE}/${id}/notify`, { target, message }),

  exportPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`${BASE}/${id}/export-pdf`, { responseType: 'blob' });
    return response.data as Blob;
  },
};
