import apiClient from '../../../shared/api/client';
import type {
  AdminBulkImportResult,
  AdminEncadrantRow,
  AdminEncadrantDetail,
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

  get: async (id: number): Promise<AdminEncadrantDetail> => {
    const response = await apiClient.get<ApiEnvelope<AdminEncadrantDetail>>(
      `/admin/encadrants/${id}`,
    );
    return response.data.data;
  },

  openChat: async (id: number, message?: string): Promise<{ conversation_id: number }> => {
    const response = await apiClient.post<ApiEnvelope<{ conversation_id: number }>>(
      `/admin/encadrants/${id}/chat/open`,
      message ? { message } : {},
    );
    const body = response.data;
    if (!body.success || !body.data?.conversation_id) {
      throw new Error(body.message || 'Failed to open chat');
    }
    return body.data;
  },

  revealCredential: async (id: number): Promise<string> => {
    const response = await apiClient.post<ApiEnvelope<{ password: string }>>(
      `/admin/encadrants/${id}/reveal-credential`,
    );
    return response.data.data.password;
  },

  regeneratePassword: async (id: number): Promise<string> => {
    const response = await apiClient.post<ApiEnvelope<{ password: string }>>(
      `/admin/encadrants/${id}/regenerate-password`,
    );
    return response.data.data.password;
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

  updateProfile: async (id: number, payload: FormData): Promise<AdminEncadrantDetail> => {
    const response = await apiClient.patch<ApiEnvelope<AdminEncadrantDetail>>(
      `/admin/encadrants/${id}/profile`,
      payload,
      { headers: { 'Content-Type': 'multipart/form-data' } },
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
