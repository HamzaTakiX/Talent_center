import apiClient from '../../../shared/api/client';
import { AuthResponse, User, StudentProfile } from '../types';

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

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Profile onboarding - Step 1: Confirm Identity
  confirmIdentity: async (data: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    phone?: string;
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
    const response = await apiClient.patch('/accounts/complete-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
