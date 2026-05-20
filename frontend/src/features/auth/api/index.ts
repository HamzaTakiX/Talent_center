import apiClient from '../../../shared/api/client';
import { AuthResponse, LoginSession, User } from '../types';

// Backend API response envelope
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = {
  // Real backend authentication
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<{
      access: string;
      refresh: string;
      user: User;
      session: { id: number; expires_at: string };
    }>>('/auth/login', { email, password });
    
    return {
      access: response.data.data.access,
      refresh: response.data.data.refresh,
      user: response.data.data.user,
    };
  },
  
  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  /** Exchange Auth0 SPA token for platform JWT (session + authorization). */
  auth0Exchange: async (accessToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<{
      access: string;
      refresh: string;
      user: User;
      session: { id: number; expires_at: string };
    }>>('/auth/providers/auth0/exchange', { access_token: accessToken });
    return {
      access: response.data.data.access,
      refresh: response.data.data.refresh,
      user: response.data.data.user,
    };
  },

  updateMe: async (payload: FormData | Record<string, unknown>): Promise<User> => {
    const isFormData = payload instanceof FormData;
    const response = await apiClient.patch<ApiResponse<User>>('/auth/me', payload, isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined);
    return response.data.data;
  },

  changePassword: async (data: {
    old_password: string;
    new_password: string;
    logout_other_sessions?: boolean;
  }): Promise<void> => {
    await apiClient.post<ApiResponse<Record<string, never>>>('/auth/change-password', data);
  },

  getSessions: async (): Promise<LoginSession[]> => {
    const response = await apiClient.get<ApiResponse<LoginSession[]>>('/auth/sessions');
    return response.data.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<{
      access: string;
      refresh: string;
      user: User;
      session: { id: number; expires_at: string };
    }>>('/auth/refresh', { refresh: refreshToken });
    
    return {
      access: response.data.data.access,
      refresh: response.data.data.refresh,
      user: response.data.data.user,
    };
  },

  /** Revoke the current server session. Best-effort — never blocks local sign-out. */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Session may already be expired or revoked; local cleanup still proceeds.
    }
  },

  // Profile onboarding - Step 1: Confirm Identity
  confirmIdentity: async (data: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    phone?: string;
    program_major?: string;
    current_class?: string;
    filiere_id?: number | null;
    class_group_id?: number | null;
  }): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<{
      id: number;
      first_name: string;
      last_name: string;
      phone: string;
      date_of_birth: string;
    }>>('/accounts/confirm-identity', data);
    
    // After confirming identity, fetch updated user data
    const updatedUser = await authApi.me();
    return updatedUser;
  },

  completeProfile: async (formData: FormData): Promise<User> => {
    await apiClient.patch('/accounts/complete-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return authApi.me();
  },
};
