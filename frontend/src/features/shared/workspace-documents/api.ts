import apiClient from '../../../shared/api/client';
import type {
  WorkspaceDocument,
  WorkspaceDocumentReviewPayload,
} from './types';

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE = '/encadrant/workspace/documents';

export const workspaceDocumentsApi = {
  list: async (studentProfileId?: number): Promise<WorkspaceDocument[]> => {
    const response = await apiClient.get<Envelope<{ items: WorkspaceDocument[] }>>(BASE, {
      params: studentProfileId ? { student_profile_id: studentProfileId } : undefined,
    });
    return response.data.data?.items ?? [];
  },

  upload: async (file: File, category?: string): Promise<WorkspaceDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);
    const response = await apiClient.post<Envelope<WorkspaceDocument>>(BASE, formData);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Upload failed');
    }
    return response.data.data;
  },

  remove: async (documentId: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${documentId}`);
  },

  review: async (
    documentId: number,
    payload: WorkspaceDocumentReviewPayload,
  ): Promise<WorkspaceDocument> => {
    const response = await apiClient.post<Envelope<WorkspaceDocument>>(
      `${BASE}/${documentId}/review`,
      payload,
    );
    if (!response.data.data) {
      throw new Error(response.data.message || 'Review failed');
    }
    return response.data.data;
  },

  markViewed: async (documentId: number): Promise<WorkspaceDocument> => {
    const response = await apiClient.post<Envelope<WorkspaceDocument>>(
      `${BASE}/${documentId}/viewed`,
    );
    if (!response.data.data) {
      throw new Error(response.data.message || 'Mark viewed failed');
    }
    return response.data.data;
  },
};
