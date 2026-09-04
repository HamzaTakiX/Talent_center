import axios from 'axios';
import apiClient from '../../../../../shared/api/client';
import type { ApiEnvelope } from '../../../../admin/api/types';

export type SupervisionChatOpenResult = {
  conversation_id: number;
  encadrant_profile_id: number;
  encadrant_name: string;
  student_profile_id: number;
  student_name: string;
};

export const studentEncadrantChatApi = {
  openChat: async (): Promise<SupervisionChatOpenResult> => {
    try {
      const response = await apiClient.post<ApiEnvelope<SupervisionChatOpenResult>>(
        '/encadrant/chat/open',
        {},
      );
      if (!response.data.success || !response.data.data?.conversation_id) {
        throw new Error(response.data.message || 'Supervision chat unavailable');
      }
      return response.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data as { message?: string } | undefined;
        if (payload?.message) {
          throw new Error(payload.message);
        }
      }
      throw err;
    }
  },
};
