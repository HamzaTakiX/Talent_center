import apiClient from '../../../shared/api/client';
import type {
  AdminAdministratorRow,
  AdminBulkImportResult,
  BulkDeleteUsersResult,
  ApiEnvelope,
  CreateAdministratorPayload,
  PaginatedListResponse,
  UpdateAdministratorPayload,
} from './types';

export const adminAdministratorsApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedListResponse<AdminAdministratorRow>> => {
    const response = await apiClient.get<ApiEnvelope<PaginatedListResponse<AdminAdministratorRow>>>(
      '/admin/administrators',
      { params },
    );
    return response.data.data;
  },

  get: async (id: number): Promise<AdminAdministratorRow> => {
    const response = await apiClient.get<ApiEnvelope<AdminAdministratorRow>>(
      `/admin/administrators/${id}`,
    );
    return response.data.data;
  },

  revealCredential: async (id: number): Promise<string> => {
    const response = await apiClient.post<ApiEnvelope<{ password: string }>>(
      `/admin/administrators/${id}/reveal-credential`,
    );
    return response.data.data.password;
  },

  regeneratePassword: async (id: number): Promise<string> => {
    const response = await apiClient.post<ApiEnvelope<{ password: string }>>(
      `/admin/administrators/${id}/regenerate-password`,
    );
    return response.data.data.password;
  },

  create: async (payload: CreateAdministratorPayload): Promise<AdminAdministratorRow> => {
    const response = await apiClient.post<ApiEnvelope<AdminAdministratorRow>>(
      '/admin/administrators',
      payload,
    );
    return response.data.data;
  },

  update: async (
    id: number,
    payload: UpdateAdministratorPayload,
  ): Promise<AdminAdministratorRow> => {
    const response = await apiClient.patch<ApiEnvelope<AdminAdministratorRow>>(
      `/admin/administrators/${id}`,
      payload,
    );
    return response.data.data;
  },

  seedRbac: async (): Promise<Record<string, number>> => {
    const response = await apiClient.post<ApiEnvelope<Record<string, number>>>(
      '/admin/rbac/seed',
    );
    return response.data.data;
  },

  importFromFile: async (file: File): Promise<AdminBulkImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiEnvelope<AdminBulkImportResult>>(
      '/admin/administrators/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/administrators/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<BulkDeleteUsersResult> => {
    const response = await apiClient.post<ApiEnvelope<BulkDeleteUsersResult>>(
      '/admin/administrators/bulk-delete',
      { ids },
    );
    const body = response.data;
    if (!body.success) {
      throw new Error(body.message || 'Bulk delete failed');
    }
    return body.data;
  },
};
