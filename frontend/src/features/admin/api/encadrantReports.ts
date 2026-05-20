import apiClient from '../../../shared/api/client';
import type { EncadrantReportRow } from '../encadrant/reports/data/encadrantReportsMock';
import type { ApiEnvelope } from './types';

export const adminEncadrantReportsApi = {
  /** Rapports reçus des encadrants (soumissions plateforme). */
  list: async (): Promise<EncadrantReportRow[]> => {
    const response = await apiClient.get<ApiEnvelope<{ items: EncadrantReportRow[] }>>(
      '/admin/encadrant-reports',
    );
    return response.data.data?.items ?? [];
  },
};
