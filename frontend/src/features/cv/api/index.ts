import apiClient from '../../../shared/api/client';
import {
  ApiEnvelope,
  CvAiAnalysis,
  CvAsset,
  CvSection,
  CvShareLink,
  CvTemplate,
  CvVersion,
  PublicCv,
  SectionType,
  StudentCv,
  StudentCvListItem,
} from '../types';

// All cv_builder endpoints are mounted under /cv/ (see core/urls.py).
// The base URL ('/api') is already set on apiClient.

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    const msg = envelope.message || 'Request failed';
    throw new Error(msg);
  }
  return envelope.data;
}

export const cvApi = {
  // ---- Templates -----------------------------------------------------------
  listTemplates: async (): Promise<CvTemplate[]> => {
    const res = await apiClient.get<ApiEnvelope<CvTemplate[]>>('/cv/templates/');
    return unwrap(res.data);
  },

  getTemplate: async (id: number): Promise<CvTemplate> => {
    const res = await apiClient.get<ApiEnvelope<CvTemplate>>(`/cv/templates/${id}/`);
    return unwrap(res.data);
  },

  // ---- Student CVs ---------------------------------------------------------
  listMyCvs: async (): Promise<StudentCvListItem[]> => {
    const res = await apiClient.get<ApiEnvelope<StudentCvListItem[]>>('/cv/student-cvs/');
    return unwrap(res.data);
  },

  getCv: async (id: number): Promise<StudentCv> => {
    const res = await apiClient.get<ApiEnvelope<StudentCv>>(`/cv/student-cvs/${id}/`);
    return unwrap(res.data);
  },

  createCv: async (payload: { title?: string; template_id?: number } = {}): Promise<StudentCv> => {
    const res = await apiClient.post<ApiEnvelope<StudentCv>>('/cv/student-cvs/', payload);
    return unwrap(res.data);
  },

  updateCv: async (id: number, payload: { title?: string; status?: string }): Promise<StudentCv> => {
    const res = await apiClient.patch<ApiEnvelope<StudentCv>>(`/cv/student-cvs/${id}/`, payload);
    return unwrap(res.data);
  },

  deleteCv: async (id: number): Promise<void> => {
    await apiClient.delete(`/cv/student-cvs/${id}/`);
  },

  makePrimary: async (id: number): Promise<StudentCvListItem> => {
    const res = await apiClient.post<ApiEnvelope<StudentCvListItem>>(
      `/cv/student-cvs/${id}/make-primary/`,
      {},
    );
    return unwrap(res.data);
  },

  switchTemplate: async (id: number, templateId: number): Promise<StudentCv> => {
    const res = await apiClient.post<ApiEnvelope<StudentCv>>(
      `/cv/student-cvs/${id}/switch-template/`,
      { template_id: templateId },
    );
    return unwrap(res.data);
  },

  // ---- Sections ------------------------------------------------------------
  addSection: async (
    cvId: number,
    payload: { section_type: SectionType; label?: string; slot_name?: string },
  ): Promise<CvSection> => {
    const res = await apiClient.post<ApiEnvelope<CvSection>>(
      `/cv/student-cvs/${cvId}/sections/`,
      payload,
    );
    return unwrap(res.data);
  },

  updateSection: async (
    sectionId: number,
    payload: Partial<Pick<CvSection, 'label' | 'is_visible' | 'slot_name' | 'config_json' | 'content_json'>>,
  ): Promise<CvSection> => {
    const res = await apiClient.patch<ApiEnvelope<CvSection>>(
      `/cv/sections/${sectionId}/`,
      payload,
    );
    return unwrap(res.data);
  },

  deleteSection: async (sectionId: number): Promise<void> => {
    await apiClient.delete(`/cv/sections/${sectionId}/`);
  },

  reorderSections: async (cvId: number, orderedIds: number[]): Promise<CvSection[]> => {
    const res = await apiClient.post<ApiEnvelope<CvSection[]>>(
      `/cv/student-cvs/${cvId}/reorder-sections/`,
      { order: orderedIds },
    );
    return unwrap(res.data);
  },

  // ---- Assets --------------------------------------------------------------
  uploadAsset: async (
    cvId: number,
    formData: FormData,
  ): Promise<CvAsset> => {
    const res = await apiClient.post<ApiEnvelope<CvAsset>>(
      `/cv/student-cvs/${cvId}/assets/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return unwrap(res.data);
  },

  deleteAsset: async (assetId: number): Promise<void> => {
    await apiClient.delete(`/cv/assets/${assetId}/`);
  },

  // ---- Versions ------------------------------------------------------------
  listVersions: async (cvId: number): Promise<CvVersion[]> => {
    const res = await apiClient.get<ApiEnvelope<CvVersion[]>>(
      `/cv/student-cvs/${cvId}/versions/`,
    );
    return unwrap(res.data);
  },

  saveVersion: async (cvId: number, changeNote?: string): Promise<CvVersion> => {
    const res = await apiClient.post<ApiEnvelope<CvVersion>>(
      `/cv/student-cvs/${cvId}/save-version/`,
      { change_note: changeNote ?? '' },
    );
    return unwrap(res.data);
  },

  restoreVersion: async (cvId: number, versionId: number): Promise<StudentCv> => {
    const res = await apiClient.post<ApiEnvelope<StudentCv>>(
      `/cv/student-cvs/${cvId}/restore-version/${versionId}/`,
      {},
    );
    return unwrap(res.data);
  },

  // ---- AI analysis ---------------------------------------------------------
  analyze: async (cvId: number): Promise<CvAiAnalysis> => {
    const res = await apiClient.post<ApiEnvelope<CvAiAnalysis>>(
      `/cv/student-cvs/${cvId}/analyze/`,
      {},
    );
    return unwrap(res.data);
  },

  listAnalyses: async (cvId: number): Promise<CvAiAnalysis[]> => {
    const res = await apiClient.get<ApiEnvelope<CvAiAnalysis[]>>(
      `/cv/student-cvs/${cvId}/analysis-history/`,
    );
    return unwrap(res.data);
  },

  // ---- Export --------------------------------------------------------------
  exportPdf: async (cvId: number): Promise<{ cv_id: number; title: string; template: any; sections: any[] }> => {
    const res = await apiClient.post<ApiEnvelope<any>>(
      `/cv/student-cvs/${cvId}/export-pdf/`,
      {},
    );
    return unwrap(res.data);
  },

  exportPdfServer: async (cvId: number): Promise<Blob> => {
    const res = await apiClient.post<Blob>(
      `/cv/student-cvs/${cvId}/export-pdf/`,
      { mode: 'server' },
      { responseType: 'blob' },
    );
    return res.data;
  },

  // ---- Share links ---------------------------------------------------------
  listShareLinks: async (cvId: number): Promise<CvShareLink[]> => {
    const res = await apiClient.get<ApiEnvelope<CvShareLink[]>>(
      `/cv/student-cvs/${cvId}/share-links/`,
    );
    return unwrap(res.data);
  },

  createShareLink: async (
    cvId: number,
    payload: { label?: string; expires_at?: string | null } = {},
  ): Promise<CvShareLink> => {
    const res = await apiClient.post<ApiEnvelope<CvShareLink>>(
      `/cv/student-cvs/${cvId}/share-links/`,
      payload,
    );
    return unwrap(res.data);
  },

  updateShareLink: async (
    linkId: number,
    payload: { label?: string; is_active?: boolean; expires_at?: string | null },
  ): Promise<CvShareLink> => {
    const res = await apiClient.patch<ApiEnvelope<CvShareLink>>(
      `/cv/share-links/${linkId}/`,
      payload,
    );
    return unwrap(res.data);
  },

  deleteShareLink: async (linkId: number): Promise<void> => {
    await apiClient.delete(`/cv/share-links/${linkId}/`);
  },

  getPublicCv: async (token: string): Promise<PublicCv> => {
    const res = await apiClient.get<ApiEnvelope<PublicCv>>(`/cv/public/${token}/`);
    return unwrap(res.data);
  },
};
