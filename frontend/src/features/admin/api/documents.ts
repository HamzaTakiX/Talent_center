import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';
import type {
  AdministrativeResourceItem,
  DocumentListParams,
  DocumentRequestDetail,
  DocumentsAnalyticsData,
  DocumentsDashboardData,
  DocumentTemplateItem,
  DocumentTypeConfig,
  PaginatedDocumentRequests,
  ReservationSlot,
  SlaRuleItem,
  WorkflowDefinition,
} from '../Documents_admin/types';
import type {
  DocumentServiceCatalogItem,
  DocumentServiceWritePayload,
} from '../Documents_admin/types/documentServiceCatalog';

const BASE = '/admin/documents';

function buildListParams(params?: DocumentListParams): Record<string, string | number> {
  if (!params) return {};
  const out: Record<string, string | number> = {};
  const keys: (keyof DocumentListParams)[] = [
    'page', 'page_size', 'search', 'status', 'priority', 'document_type', 'service', 'ordering',
  ];
  for (const k of keys) {
    const v = params[k];
    if (v !== undefined && v !== '') out[k] = v as string | number;
  }
  return out;
}

export const adminDocumentsApi = {
  dashboard: async (): Promise<DocumentsDashboardData> => {
    const res = await apiClient.get<ApiEnvelope<DocumentsDashboardData>>(`${BASE}/dashboard`);
    return res.data.data!;
  },

  list: async (params?: DocumentListParams): Promise<PaginatedDocumentRequests> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedDocumentRequests>>(`${BASE}/requests`, {
      params: buildListParams(params),
    });
    return res.data.data ?? { items: [], page: 1, page_size: 15, total: 0, total_pages: 0 };
  },

  detail: async (id: string): Promise<DocumentRequestDetail> => {
    const res = await apiClient.get<ApiEnvelope<DocumentRequestDetail>>(`${BASE}/requests/${id}`);
    return res.data.data!;
  },

  action: async (id: string, action: string, payload?: Record<string, unknown>) => {
    const res = await apiClient.post<ApiEnvelope<unknown>>(`${BASE}/requests/${id}/${action}`, payload ?? {});
    return res.data.data;
  },

  types: async (): Promise<DocumentTypeConfig[]> => {
    const res = await apiClient.get<ApiEnvelope<DocumentTypeConfig[]>>(`${BASE}/types`);
    return res.data.data ?? [];
  },

  updateType: async (id: string, payload: Partial<DocumentTypeConfig>) => {
    const res = await apiClient.patch<ApiEnvelope<DocumentTypeConfig>>(`${BASE}/types/${id}`, payload);
    return res.data.data;
  },

  workflows: async (): Promise<WorkflowDefinition[]> => {
    const res = await apiClient.get<ApiEnvelope<WorkflowDefinition[]>>(`${BASE}/workflows`);
    return res.data.data ?? [];
  },

  resources: async (): Promise<AdministrativeResourceItem[]> => {
    const res = await apiClient.get<ApiEnvelope<AdministrativeResourceItem[]>>(`${BASE}/resources`);
    return res.data.data ?? [];
  },

  templates: async (): Promise<DocumentTemplateItem[]> => {
    const res = await apiClient.get<ApiEnvelope<DocumentTemplateItem[]>>(`${BASE}/templates`);
    return res.data.data ?? [];
  },

  slaRules: async (): Promise<SlaRuleItem[]> => {
    const res = await apiClient.get<ApiEnvelope<SlaRuleItem[]>>(`${BASE}/sla-rules`);
    return res.data.data ?? [];
  },

  analytics: async (): Promise<DocumentsAnalyticsData> => {
    const res = await apiClient.get<ApiEnvelope<DocumentsAnalyticsData>>(`${BASE}/analytics`);
    return res.data.data!;
  },

  reservations: async (params?: { date?: string }): Promise<{
    date: string;
    occupancy: DocumentsDashboardData['reservationOccupancy'];
    total: number;
    items: ReservationSlot[];
  }> => {
    const res = await apiClient.get<ApiEnvelope<{
      date: string;
      occupancy: DocumentsDashboardData['reservationOccupancy'];
      total: number;
      items: ReservationSlot[];
    }>>(`${BASE}/reservations`, { params });
    return res.data.data ?? { date: '', occupancy: [], total: 0, items: [] };
  },

  workload: async (): Promise<{ items: DocumentsDashboardData['serviceWorkload'] }> => {
    const res = await apiClient.get<ApiEnvelope<{ items: DocumentsDashboardData['serviceWorkload'] }>>(
      `${BASE}/workload`,
    );
    return res.data.data ?? { items: [] };
  },

  catalogList: async (): Promise<DocumentServiceCatalogItem[]> => {
    const res = await apiClient.get<ApiEnvelope<DocumentServiceCatalogItem[]>>(`${BASE}/catalog`);
    return res.data.data ?? [];
  },

  catalogDetail: async (id: string): Promise<DocumentServiceCatalogItem> => {
    const res = await apiClient.get<ApiEnvelope<DocumentServiceCatalogItem>>(`${BASE}/catalog/${id}`);
    return res.data.data!;
  },

  catalogCreate: async (payload: DocumentServiceWritePayload) => {
    const res = await apiClient.post<ApiEnvelope<DocumentServiceCatalogItem>>(`${BASE}/catalog`, payload);
    return res.data.data!;
  },

  catalogUpdate: async (id: string, payload: Partial<DocumentServiceWritePayload>) => {
    const res = await apiClient.patch<ApiEnvelope<DocumentServiceCatalogItem>>(`${BASE}/catalog/${id}`, payload);
    return res.data.data!;
  },

  catalogSeed: async () => {
    const res = await apiClient.post<ApiEnvelope<{ created: number }>>(`${BASE}/catalog/seed`);
    return res.data.data;
  },

  catalogTemplateFile: async (id: string): Promise<Blob> => {
    const res = await apiClient.get<Blob>(`${BASE}/catalog/${id}/template-file`, {
      responseType: 'blob',
      validateStatus: (status) => status < 500,
    });
    if (res.status >= 400) {
      throw new Error('template file not found');
    }
    const blob = res.data;
    if (blob.type.includes('json')) {
      throw new Error('template file not found');
    }
    return blob;
  },

  catalogUploadTemplateFile: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiEnvelope<DocumentServiceCatalogItem>>(
      `${BASE}/catalog/${id}/template-file`,
      formData,
    );
    return res.data.data!;
  },
};
