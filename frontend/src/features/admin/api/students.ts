import apiClient from '../../../shared/api/client';
import type {
  AdminStudentRow,
  AdminStudentDetail,
  ApiEnvelope,
  CreateStudentPayload,
  PaginatedListResponse,
  StudentDashboardStats,
  BulkDeleteUsersResult,
  StudentImportResult,
  UpdateStudentAccessPayload,
  UpdateStudentAssignmentPayload,
} from './types';

export const adminStudentsApi = {
  stats: async (): Promise<StudentDashboardStats> => {
    const response = await apiClient.get<ApiEnvelope<StudentDashboardStats>>('/admin/students/stats');
    return response.data.data;
  },

  list: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedListResponse<AdminStudentRow>> => {
    const response = await apiClient.get<ApiEnvelope<PaginatedListResponse<AdminStudentRow>>>(
      '/admin/students',
      { params },
    );
    return response.data.data;
  },

  get: async (id: number): Promise<AdminStudentDetail> => {
    const response = await apiClient.get<ApiEnvelope<AdminStudentDetail>>(`/admin/students/${id}`);
    return response.data.data;
  },

  openChat: async (id: number, message?: string): Promise<{ conversation_id: number }> => {
    const response = await apiClient.post<ApiEnvelope<{ conversation_id: number }>>(
      `/admin/students/${id}/chat/open`,
      message ? { message } : {},
    );
    const body = response.data;
    if (!body.success || !body.data?.conversation_id) {
      throw new Error(body.message || 'Failed to open chat');
    }
    return body.data;
  },

  create: async (payload: CreateStudentPayload): Promise<AdminStudentRow> => {
    const response = await apiClient.post<ApiEnvelope<AdminStudentRow>>('/admin/students', payload);
    return response.data.data;
  },

  updateAccess: async (id: number, payload: UpdateStudentAccessPayload): Promise<AdminStudentRow> => {
    const response = await apiClient.patch<ApiEnvelope<AdminStudentRow>>(
      `/admin/students/${id}/access`,
      payload,
    );
    return response.data.data;
  },

  updateAssignment: async (
    id: number,
    payload: UpdateStudentAssignmentPayload,
  ): Promise<AdminStudentDetail> => {
    const response = await apiClient.patch<ApiEnvelope<AdminStudentDetail>>(
      `/admin/students/${id}/assignment`,
      payload,
    );
    return response.data.data;
  },

  updateProfile: async (id: number, payload: FormData): Promise<AdminStudentDetail> => {
    const response = await apiClient.patch<ApiEnvelope<AdminStudentDetail>>(
      `/admin/students/${id}/profile`,
      payload,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  },

  regeneratePassword: async (id: number): Promise<string> => {
    const response = await apiClient.post<ApiEnvelope<{ password: string }>>(
      `/admin/students/${id}/regenerate-password`,
    );
    return response.data.data.password;
  },

  revealCredential: async (id: number): Promise<string> => {
    const response = await apiClient.post<ApiEnvelope<{ password: string }>>(
      `/admin/students/${id}/reveal-credential`,
    );
    return response.data.data.password;
  },

  importFromFile: async (file: File): Promise<StudentImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiEnvelope<StudentImportResult>>(
      '/admin/students/import',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300_000,
      },
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/students/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<BulkDeleteUsersResult> => {
    const response = await apiClient.post<ApiEnvelope<BulkDeleteUsersResult>>(
      '/admin/students/bulk-delete',
      { ids },
    );
    const body = response.data;
    if (!body.success) {
      throw new Error(body.message || 'Bulk delete failed');
    }
    return body.data;
  },
};
