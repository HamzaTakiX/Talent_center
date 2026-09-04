import apiClient from '../../../../shared/api/client';
import type {
  CollaborationContextPayload,
  CreateMeetingSessionRequest,
  MeetingSessionPayload,
  ScheduledMeetingSummary,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const meetingSessionsApi = {
  getCollaborationContext: async (): Promise<CollaborationContextPayload> => {
    const response = await apiClient.get<ApiResponse<CollaborationContextPayload>>(
      '/encadrant/collaboration/context',
    );
    return response.data.data;
  },

  createSession: async (payload: CreateMeetingSessionRequest): Promise<MeetingSessionPayload> => {
    const response = await apiClient.post<ApiResponse<MeetingSessionPayload>>(
      '/encadrant/meeting-sessions',
      payload,
    );
    return response.data.data;
  },

  listScheduledMeetings: async (): Promise<ScheduledMeetingSummary[]> => {
    const response = await apiClient.get<ApiResponse<ScheduledMeetingSummary[]>>(
      '/encadrant/meeting-sessions/scheduled',
    );
    return response.data.data;
  },

  getSession: async (sessionId: string, mode?: string): Promise<MeetingSessionPayload> => {
    const response = await apiClient.get<ApiResponse<MeetingSessionPayload>>(
      `/encadrant/meeting-sessions/${sessionId}`,
      { params: mode ? { mode } : undefined },
    );
    return response.data.data;
  },

  joinSession: async (sessionId: string, mode: string): Promise<MeetingSessionPayload> => {
    const response = await apiClient.post<ApiResponse<MeetingSessionPayload>>(
      `/encadrant/meeting-sessions/${sessionId}/join`,
      { mode },
    );
    return response.data.data;
  },

  endSession: async (sessionId: string): Promise<MeetingSessionPayload> => {
    const response = await apiClient.post<ApiResponse<MeetingSessionPayload>>(
      `/encadrant/meeting-sessions/${sessionId}/end`,
    );
    return response.data.data;
  },
};
