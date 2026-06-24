import apiClient from '../../../shared/api/client';
import type { IntelligencePlatformOverview } from './types';

export const profileIntelligenceApi = {
  overview: async (): Promise<IntelligencePlatformOverview> => {
    const response = await apiClient.get<IntelligencePlatformOverview>(
      '/profile-intelligence/overview/',
    );
    return response.data;
  },

  programAnalytics: async (params?: {
    filiere_id?: number;
    class_group_id?: number;
    academic_level_id?: number;
    academic_sector_id?: number;
  }) => {
    const response = await apiClient.get('/profile-intelligence/program-analytics/', { params });
    return response.data;
  },

  studentDashboard: async (studentProfileId: number) => {
    const response = await apiClient.get(
      `/profile-intelligence/${studentProfileId}/dashboard/`,
    );
    return response.data;
  },

  analyze: async (studentProfileId: number) => {
    const response = await apiClient.post(
      `/profile-intelligence/analyze/${studentProfileId}/`,
    );
    return response.data;
  },
};
