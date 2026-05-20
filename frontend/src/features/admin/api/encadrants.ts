import apiClient from '../../../shared/api/client';
import type {
  AdminBulkImportResult,
  AdminEncadrantRow,
  BulkDeleteUsersResult,
  ApiEnvelope,
  CreateEncadrantPayload,
  EncadrantScopeRepairResult,
  PaginatedListResponse,
  UpdateEncadrantPayload,
} from './types';

export const adminEncadrantsApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedListResponse<AdminEncadrantRow>> => {
    const response = await apiClient.get<ApiEnvelope<PaginatedListResponse<AdminEncadrantRow>>>(
      '/admin/encadrants',
      { params },
    );
    return response.data.data;
  },

  get: async (id: number): Promise<AdminEncadrantRow> => {
    const response = await apiClient.get<ApiEnvelope<AdminEncadrantRow>>(
      `/admin/encadrants/${id}`,
    );
    return response.data.data;
  },

  create: async (payload: CreateEncadrantPayload): Promise<AdminEncadrantRow> => {
    const response = await apiClient.post<ApiEnvelope<AdminEncadrantRow>>(
      '/admin/encadrants',
      payload,
    );
    return response.data.data;
  },

  update: async (id: number, payload: UpdateEncadrantPayload): Promise<AdminEncadrantRow> => {
    const response = await apiClient.patch<ApiEnvelope<AdminEncadrantRow>>(
      `/admin/encadrants/${id}`,
      payload,
    );
    return response.data.data;
  },

  repairScopes: async (dryRun = false): Promise<EncadrantScopeRepairResult> => {
    const response = await apiClient.post<ApiEnvelope<EncadrantScopeRepairResult>>(
      '/admin/encadrants/repair-scopes',
      { dry_run: dryRun },
    );
    return response.data.data;
  },

  importFromFile: async (file: File): Promise<AdminBulkImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiEnvelope<AdminBulkImportResult>>(
      '/admin/encadrants/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/encadrants/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<BulkDeleteUsersResult> => {
    const response = await apiClient.post<ApiEnvelope<BulkDeleteUsersResult>>(
      '/admin/encadrants/bulk-delete',
      { ids },
    );
    const body = response.data;
    if (!body.success) {
      throw new Error(body.message || 'Bulk delete failed');
    }
    return body.data;
  },
};
