import apiClient from '../../../../shared/api/client';
import type { ApiEnvelope } from '../../api/types';
import type {
  AcademicClassRow,
  AcademicLevelRow,
  AcademicTrackRow,
  AuditLogEntry,
  ImpactSummary,
  InternshipFrameworkRow,
  WorkModeRow,
} from '../types/academicStructureTypes';

const BASE = '/admin/academic-structure';

const withLang = (lang?: string) => (lang ? { lang } : {});

export const academicStructureApi = {
  listTracks: async (params?: { include_archived?: boolean; search?: string; lang?: string }): Promise<AcademicTrackRow[]> => {
    const response = await apiClient.get<ApiEnvelope<AcademicTrackRow[]>>(`${BASE}/tracks`, {
      params: {
        include_archived: params?.include_archived ? 'true' : undefined,
        search: params?.search,
        ...withLang(params?.lang),
      },
    });
    return response.data.data;
  },

  createTrack: async (payload: Partial<AcademicTrackRow>): Promise<AcademicTrackRow> => {
    const response = await apiClient.post<ApiEnvelope<AcademicTrackRow>>(`${BASE}/tracks`, payload);
    return response.data.data;
  },

  updateTrack: async (id: number, payload: Partial<AcademicTrackRow>): Promise<AcademicTrackRow> => {
    const response = await apiClient.patch<ApiEnvelope<AcademicTrackRow>>(`${BASE}/tracks/${id}`, payload);
    return response.data.data;
  },

  archiveTrack: async (id: number): Promise<{ entity: AcademicTrackRow; impact: ImpactSummary }> => {
    const response = await apiClient.delete<ApiEnvelope<{ entity: AcademicTrackRow; impact: ImpactSummary }>>(
      `${BASE}/tracks/${id}`,
    );
    return response.data.data;
  },

  reorderTracks: async (orderedIds: number[]): Promise<void> => {
    await apiClient.post(`${BASE}/tracks/reorder`, { ordered_ids: orderedIds });
  },

  listLevels: async (params?: { include_archived?: boolean; filiere_id?: number; lang?: string }): Promise<AcademicLevelRow[]> => {
    const response = await apiClient.get<ApiEnvelope<AcademicLevelRow[]>>(`${BASE}/levels`, {
      params: {
        include_archived: params?.include_archived ? 'true' : undefined,
        filiere_id: params?.filiere_id,
        ...withLang(params?.lang),
      },
    });
    return response.data.data;
  },

  createLevel: async (payload: Partial<AcademicLevelRow>): Promise<AcademicLevelRow> => {
    const response = await apiClient.post<ApiEnvelope<AcademicLevelRow>>(`${BASE}/levels`, payload);
    return response.data.data;
  },

  updateLevel: async (id: number, payload: Partial<AcademicLevelRow>): Promise<AcademicLevelRow> => {
    const response = await apiClient.patch<ApiEnvelope<AcademicLevelRow>>(`${BASE}/levels/${id}`, payload);
    return response.data.data;
  },

  archiveLevel: async (id: number): Promise<{ entity: AcademicLevelRow; impact: ImpactSummary }> => {
    const response = await apiClient.delete<ApiEnvelope<{ entity: AcademicLevelRow; impact: ImpactSummary }>>(
      `${BASE}/levels/${id}`,
    );
    return response.data.data;
  },

  listClasses: async (params?: { include_archived?: boolean; filiere_id?: number; lang?: string }): Promise<AcademicClassRow[]> => {
    const response = await apiClient.get<ApiEnvelope<AcademicClassRow[]>>(`${BASE}/classes`, {
      params: {
        include_archived: params?.include_archived ? 'true' : undefined,
        filiere_id: params?.filiere_id,
        ...withLang(params?.lang),
      },
    });
    return response.data.data;
  },

  createClass: async (payload: Partial<AcademicClassRow>): Promise<AcademicClassRow> => {
    const response = await apiClient.post<ApiEnvelope<AcademicClassRow>>(`${BASE}/classes`, payload);
    return response.data.data;
  },

  updateClass: async (id: number, payload: Partial<AcademicClassRow>): Promise<AcademicClassRow> => {
    const response = await apiClient.patch<ApiEnvelope<AcademicClassRow>>(`${BASE}/classes/${id}`, payload);
    return response.data.data;
  },

  archiveClass: async (id: number): Promise<{ entity: AcademicClassRow; impact: ImpactSummary }> => {
    const response = await apiClient.delete<ApiEnvelope<{ entity: AcademicClassRow; impact: ImpactSummary }>>(
      `${BASE}/classes/${id}`,
    );
    return response.data.data;
  },

  listInternshipFramework: async (params?: {
    include_archived?: boolean;
    filiere_id?: number;
    level_id?: number;
    lang?: string;
  }): Promise<InternshipFrameworkRow[]> => {
    const response = await apiClient.get<ApiEnvelope<InternshipFrameworkRow[]>>(`${BASE}/internship-framework`, {
      params: {
        include_archived: params?.include_archived ? 'true' : undefined,
        filiere_id: params?.filiere_id,
        level_id: params?.level_id,
        ...withLang(params?.lang),
      },
    });
    return response.data.data;
  },

  createInternshipType: async (payload: Partial<InternshipFrameworkRow>): Promise<InternshipFrameworkRow> => {
    const response = await apiClient.post<ApiEnvelope<InternshipFrameworkRow>>(
      `${BASE}/internship-framework`,
      payload,
    );
    return response.data.data;
  },

  updateInternshipType: async (
    id: number,
    payload: Partial<InternshipFrameworkRow>,
  ): Promise<InternshipFrameworkRow> => {
    const response = await apiClient.patch<ApiEnvelope<InternshipFrameworkRow>>(
      `${BASE}/internship-framework/${id}`,
      payload,
    );
    return response.data.data;
  },

  archiveInternshipType: async (
    id: number,
  ): Promise<{ entity: InternshipFrameworkRow; impact: ImpactSummary }> => {
    const response = await apiClient.delete<
      ApiEnvelope<{ entity: InternshipFrameworkRow; impact: ImpactSummary }>
    >(`${BASE}/internship-framework/${id}`);
    return response.data.data;
  },

  listWorkModes: async (includeArchived?: boolean, lang?: string): Promise<WorkModeRow[]> => {
    const response = await apiClient.get<ApiEnvelope<WorkModeRow[]>>(`${BASE}/work-modes`, {
      params: {
        include_archived: includeArchived ? 'true' : undefined,
        ...withLang(lang),
      },
    });
    return response.data.data;
  },

  createWorkMode: async (payload: Partial<WorkModeRow>): Promise<WorkModeRow> => {
    const response = await apiClient.post<ApiEnvelope<WorkModeRow>>(`${BASE}/work-modes`, payload);
    return response.data.data;
  },

  updateWorkMode: async (id: number, payload: Partial<WorkModeRow>): Promise<WorkModeRow> => {
    const response = await apiClient.patch<ApiEnvelope<WorkModeRow>>(`${BASE}/work-modes/${id}`, payload);
    return response.data.data;
  },

  archiveWorkMode: async (id: number): Promise<{ entity: WorkModeRow; impact: ImpactSummary }> => {
    const response = await apiClient.delete<ApiEnvelope<{ entity: WorkModeRow; impact: ImpactSummary }>>(
      `${BASE}/work-modes/${id}`,
    );
    return response.data.data;
  },

  deleteTrackPermanently: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/tracks/${id}/permanent`);
  },

  deleteLevelPermanently: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/levels/${id}/permanent`);
  },

  deleteClassPermanently: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/classes/${id}/permanent`);
  },

  deleteInternshipTypePermanently: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/internship-framework/${id}/permanent`);
  },

  deleteWorkModePermanently: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/work-modes/${id}/permanent`);
  },

  getImpact: async (entityType: string, entityId: number): Promise<ImpactSummary> => {
    const response = await apiClient.get<ApiEnvelope<ImpactSummary>>(
      `${BASE}/impact/${entityType}/${entityId}`,
    );
    return response.data.data;
  },

  getAuditLog: async (limit = 50): Promise<AuditLogEntry[]> => {
    const response = await apiClient.get<ApiEnvelope<AuditLogEntry[]>>(`${BASE}/audit`, {
      params: { limit },
    });
    return response.data.data;
  },
};
