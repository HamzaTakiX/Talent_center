import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from './types';

export type MicrosoftAccessStatus = {
  microsoft_access: boolean;
  configured: boolean;
  entra_user_id?: string | null;
  entra_user_principal_name?: string | null;
  assignment_id?: string | null;
  platform_access_granted: boolean;
  sso_enabled: boolean;
};

export const adminMicrosoftAccessApi = {
  get: async (userId: number): Promise<MicrosoftAccessStatus> => {
    const response = await apiClient.get<ApiEnvelope<MicrosoftAccessStatus>>(
      `/admin/users/${userId}/microsoft-access`,
    );
    return response.data.data;
  },

  grant: async (userId: number): Promise<MicrosoftAccessStatus> => {
    const response = await apiClient.post<ApiEnvelope<MicrosoftAccessStatus>>(
      `/admin/users/${userId}/microsoft-access`,
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to grant Microsoft access');
    }
    return response.data.data;
  },

  revoke: async (userId: number): Promise<MicrosoftAccessStatus> => {
    const response = await apiClient.delete<ApiEnvelope<MicrosoftAccessStatus>>(
      `/admin/users/${userId}/microsoft-access`,
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to revoke Microsoft access');
    }
    return response.data.data;
  },
};
