import apiClient from '../../../shared/api/client';
import axios from 'axios';
import type {
  ApiEnvelope,
  SmartAssignmentEngineResult,
  SmartAssignmentPrecheckResult,
  SmartAssignmentResultsPayload,
  SmartAssignmentRunPayload,
} from './types';

export class SmartAssignmentPrecheckError extends Error {
  readonly precheck: SmartAssignmentPrecheckResult;

  readonly status: number;

  constructor(message: string, precheck: SmartAssignmentPrecheckResult, status: number) {
    super(message);
    this.name = 'SmartAssignmentPrecheckError';
    this.precheck = precheck;
    this.status = status;
  }
}

const extractPrecheckFromError = (error: unknown): SmartAssignmentPrecheckResult | null => {
  if (!axios.isAxiosError(error) || !error.response?.data) return null;
  const body = error.response.data as ApiEnvelope<SmartAssignmentPrecheckResult>;
  if (body?.data?.issues) return body.data;
  return null;
};

export const smartAssignmentApi = {
  getResults: async (academicYear?: string): Promise<SmartAssignmentResultsPayload> => {
    const response = await apiClient.get<ApiEnvelope<SmartAssignmentResultsPayload>>(
      '/admin/smart-assignment/results',
      { params: academicYear ? { academic_year: academicYear } : undefined },
    );
    return response.data.data;
  },

  precheck: async (payload: SmartAssignmentRunPayload): Promise<SmartAssignmentPrecheckResult> => {
    const response = await apiClient.post<ApiEnvelope<SmartAssignmentPrecheckResult>>(
      '/admin/smart-assignment/precheck',
      payload,
    );
    return response.data.data;
  },

  preview: async (payload: SmartAssignmentRunPayload): Promise<SmartAssignmentEngineResult> => {
    try {
      const response = await apiClient.post<ApiEnvelope<SmartAssignmentEngineResult>>(
        '/admin/smart-assignment/preview',
        payload,
      );
      return response.data.data;
    } catch (error) {
      const precheck = extractPrecheckFromError(error);
      if (precheck && axios.isAxiosError(error) && error.response?.status === 422) {
        throw new SmartAssignmentPrecheckError('Precheck failed', precheck, 422);
      }
      throw error;
    }
  },

  run: async (payload: SmartAssignmentRunPayload): Promise<SmartAssignmentEngineResult> => {
    try {
      const response = await apiClient.post<ApiEnvelope<SmartAssignmentEngineResult>>(
        '/admin/smart-assignment/run',
        payload,
      );
      return response.data.data;
    } catch (error) {
      const precheck = extractPrecheckFromError(error);
      if (precheck && axios.isAxiosError(error)) {
        const status = error.response?.status ?? 422;
        if (status === 422 || status === 409) {
          throw new SmartAssignmentPrecheckError('Precheck failed', precheck, status);
        }
      }
      throw error;
    }
  },

  reassign: async (payload: {
    student_profile_id: number;
    encadrant_profile_id: number | null;
    academic_year?: string;
    lock?: boolean;
  }): Promise<{ assignment_id: number; encadrant_profile_id: number | null; is_locked: boolean }> => {
    const response = await apiClient.patch<
      ApiEnvelope<{ assignment_id: number; encadrant_profile_id: number | null; is_locked: boolean }>
    >('/admin/smart-assignment/reassign', payload);
    return response.data.data;
  },

  setLock: async (assignmentId: number, isLocked: boolean): Promise<{ is_locked: boolean }> => {
    const response = await apiClient.patch<ApiEnvelope<{ is_locked: boolean }>>(
      '/admin/smart-assignment/lock',
      { assignment_id: assignmentId, is_locked: isLocked },
    );
    return response.data.data;
  },
};
