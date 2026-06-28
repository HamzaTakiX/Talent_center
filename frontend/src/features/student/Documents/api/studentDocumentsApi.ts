import apiClient from '../../../../shared/api/client';
import { requireEnvelopeData } from '../../../../shared/api/envelope';
import type { ApiEnvelope } from '../../../admin/api/types';
import type { DocumentServiceCatalogItem, StudentDocumentGenerateResponse } from '../../../admin/Documents_admin/types/documentServiceCatalog';
import type { StudentDocumentsOverviewResponse } from '../types';

const BASE = '/student/documents';

export const studentDocumentsApi = {
  overview: async (): Promise<StudentDocumentsOverviewResponse> => {
    const res = await apiClient.get<ApiEnvelope<StudentDocumentsOverviewResponse>>(`${BASE}/overview`);
    return (
      res.data.data ?? {
        stats: { total: 0, pending: 0, validated: 0, reserved: 0 },
        catalog: [] as DocumentServiceCatalogItem[],
      }
    );
  },

  catalogDetail: async (id: string): Promise<DocumentServiceCatalogItem> => {
    const res = await apiClient.get<ApiEnvelope<DocumentServiceCatalogItem>>(`${BASE}/catalog/${id}`);
    if (!res.data.data) {
      throw new Error('Document not found');
    }
    return res.data.data;
  },

  createChat: async (serviceId: string, message?: string) => {
    const res = await apiClient.post<ApiEnvelope<{ conversation_id: number; document_service_id: string }>>(
      `${BASE}/catalog/${serviceId}/chat`,
      message ? { message } : {},
    );
    return res.data.data!;
  },

  createRequest: async (serviceId: string, payload?: { reason?: string }) => {
    const res = await apiClient.post<ApiEnvelope<{ id: string; reference: string }>>(
      `${BASE}/catalog/${serviceId}/request`,
      payload ?? {},
    );
    return requireEnvelopeData(res.data, 'Request submission failed');
  },

  generateDocument: async (serviceId: string): Promise<StudentDocumentGenerateResponse> => {
    const res = await apiClient.post<ApiEnvelope<StudentDocumentGenerateResponse>>(
      `${BASE}/catalog/${serviceId}/generate`,
      {},
    );
    return requireEnvelopeData(res.data, 'Document generation failed');
  },
};
