import apiClient from '../../../shared/api/client';
import type { ApiEnvelope } from '../../admin/api/types';
import type {
  PaginatedStageOffers,
  StageAnalyticsDashboard,
  StageApplication,
  StageImportJob,
  StageImportListResponse,
  StageMatchScore,
  StageOfferDetail,
  StageOfferListParams,
  StageOfferWritePayload,
  StagePipelineBoard,
  StageRecommendation,
  StageTargetingPreviewPayload,
  StageTargetingPreview,
} from '../types/stageTypes';

const BASE = '/internship-offers';

function buildListParams(params?: StageOfferListParams): Record<string, string | number> {
  if (!params) return {};
  const out: Record<string, string | number> = {};
  const keys: (keyof StageOfferListParams)[] = ['page', 'page_size', 'status', 'search', 'ordering'];
  for (const k of keys) {
    const v = params[k];
    if (v !== undefined && v !== '') out[k] = v as string | number;
  }
  return out;
}

export const stageApi = {
  dashboard: async (): Promise<StageAnalyticsDashboard> => {
    const res = await apiClient.get<ApiEnvelope<StageAnalyticsDashboard>>(`${BASE}/dashboard`);
    return res.data.data!;
  },

  list: async (params?: StageOfferListParams): Promise<PaginatedStageOffers> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedStageOffers>>(BASE, {
      params: buildListParams(params),
    });
    return res.data.data ?? { items: [], page: 1, page_size: 15, total: 0, total_pages: 0 };
  },

  detail: async (uuid: string): Promise<StageOfferDetail> => {
    const res = await apiClient.get<ApiEnvelope<StageOfferDetail>>(`${BASE}/${uuid}`);
    return res.data.data!;
  },

  create: async (payload: StageOfferWritePayload): Promise<StageOfferDetail> => {
    const res = await apiClient.post<ApiEnvelope<StageOfferDetail>>(BASE, payload);
    return res.data.data!;
  },

  update: async (uuid: string, payload: Partial<StageOfferWritePayload>): Promise<StageOfferDetail> => {
    const res = await apiClient.patch<ApiEnvelope<StageOfferDetail>>(`${BASE}/${uuid}`, payload);
    return res.data.data!;
  },

  action: async (uuid: string, action: string, payload?: Record<string, unknown>): Promise<StageOfferDetail> => {
    const res = await apiClient.post<ApiEnvelope<StageOfferDetail>>(
      `${BASE}/${uuid}/${action}`,
      payload ?? {},
    );
    return res.data.data!;
  },

  targetingPreview: async (
    uuid: string,
    payload: StageTargetingPreviewPayload,
  ): Promise<StageTargetingPreview> => {
    const res = await apiClient.post<ApiEnvelope<StageTargetingPreview>>(
      `${BASE}/${uuid}/targeting-preview`,
      payload,
    );
    return res.data.data!;
  },

  applications: async (uuid: string): Promise<StageApplication[]> => {
    const res = await apiClient.get<ApiEnvelope<StageApplication[]>>(`${BASE}/${uuid}/applications`);
    return res.data.data ?? [];
  },

  apply: async (uuid: string, payload: { cover_letter?: string; student_cv_id?: number }) => {
    const res = await apiClient.post<ApiEnvelope<StageApplication>>(`${BASE}/${uuid}/applications`, payload);
    return res.data.data!;
  },

  applicationAction: async (appUuid: string, action: string, payload?: Record<string, unknown>) => {
    const res = await apiClient.post<ApiEnvelope<StageApplication>>(
      `/internship-applications/${appUuid}/${action}`,
      payload ?? {},
    );
    return res.data.data!;
  },

  offerMatches: async (uuid: string, limit = 10): Promise<StageMatchScore[]> => {
    const res = await apiClient.get<ApiEnvelope<StageMatchScore[]>>(`${BASE}/${uuid}/matches`, {
      params: { limit },
    });
    return res.data.data ?? [];
  },

  studentMatches: async (limit = 20): Promise<StageMatchScore[]> => {
    const res = await apiClient.get<ApiEnvelope<StageMatchScore[]>>(`${BASE}/matches`, {
      params: { limit },
    });
    return res.data.data ?? [];
  },

  recommendations: async (type?: string): Promise<StageRecommendation[]> => {
    const res = await apiClient.get<ApiEnvelope<StageRecommendation[]>>(`${BASE}/recommendations`, {
      params: type ? { type } : undefined,
    });
    return res.data.data ?? [];
  },

  refreshRecommendations: async () => {
    await apiClient.post(`${BASE}/recommendations`);
  },

  pipeline: async (offerUuid?: string): Promise<StagePipelineBoard> => {
    const res = await apiClient.get<ApiEnvelope<StagePipelineBoard>>(`${BASE}/pipeline`, {
      params: offerUuid ? { offer_uuid: offerUuid } : undefined,
    });
    return res.data.data ?? { board: {}, metrics: {} };
  },

  startImport: async (sourceUrl: string): Promise<StageImportJob> => {
    const res = await apiClient.post<ApiEnvelope<StageImportJob>>(`${BASE}/import`, { source_url: sourceUrl });
    return res.data.data!;
  },

  listImports: async (params?: { page?: number; status?: string }): Promise<StageImportListResponse> => {
    const res = await apiClient.get<ApiEnvelope<StageImportListResponse>>(`${BASE}/import`, { params });
    return res.data.data ?? { items: [], pagination: {}, analytics: { total_imports: 0, published_imports: 0, failed_imports: 0, successful_extractions: 0, source_distribution: {} } };
  },

  importJob: async (jobUuid: string): Promise<StageImportJob> => {
    const res = await apiClient.get<ApiEnvelope<StageImportJob>>(`${BASE}/import/${jobUuid}`);
    return res.data.data!;
  },

  approveImport: async (
    jobUuid: string,
    overrides?: Record<string, unknown>,
    skipDuplicateCheck = false,
  ) => {
    const res = await apiClient.post<ApiEnvelope<{ job: StageImportJob; offer_uuid: string }>>(
      `${BASE}/import/${jobUuid}/approve`,
      { overrides: overrides ?? {}, skip_duplicate_check: skipDuplicateCheck },
    );
    return res.data.data!;
  },

  saveImportDraft: async (
    jobUuid: string,
    overrides?: Record<string, unknown>,
    skipDuplicateCheck = false,
  ) => {
    const res = await apiClient.post<ApiEnvelope<{ job: StageImportJob; offer_uuid: string }>>(
      `${BASE}/import/${jobUuid}/draft`,
      { overrides: overrides ?? {}, skip_duplicate_check: skipDuplicateCheck },
    );
    return res.data.data!;
  },

  rejectImport: async (jobUuid: string, reason = '') => {
    const res = await apiClient.post<ApiEnvelope<StageImportJob>>(
      `${BASE}/import/${jobUuid}/reject`,
      { reason },
    );
    return res.data.data!;
  },

  createChat: async (uuid: string, payload?: { student_profile_id?: number; message?: string }) => {
    const res = await apiClient.post<ApiEnvelope<{ conversation_id: number; unread_total: number }>>(
      `${BASE}/${uuid}/chat`,
      payload ?? {},
    );
    return res.data.data!;
  },

  journeyDashboard: async () => {
    const res = await apiClient.get<ApiEnvelope<import('../../student/internship_offers/types/journeyTypes').InternshipJourneyDashboard>>(
      `${BASE}/journey`,
    );
    return res.data.data!;
  },

  myApplications: async (activeOnly = false) => {
    const res = await apiClient.get<ApiEnvelope<import('../../student/internship_offers/types/journeyTypes').JourneyApplication[]>>(
      `${BASE}/my-applications`,
      { params: activeOnly ? { active: 'true' } : undefined },
    );
    return res.data.data ?? [];
  },

  applicationDetail: async (appUuid: string) => {
    const res = await apiClient.get<ApiEnvelope<import('../../student/internship_offers/types/journeyTypes').ApplicationDetail>>(
      `/internship-applications/${appUuid}/detail`,
    );
    return res.data.data!;
  },

  offersFeed: async () => {
    const res = await apiClient.get<ApiEnvelope<import('../../student/internship_offers/types/journeyTypes').OffersFeed>>(
      `${BASE}/feed`,
    );
    return res.data.data!;
  },

  applicationReadiness: async (offerUuid: string) => {
    const res = await apiClient.get<ApiEnvelope<import('../../student/internship_offers/types/journeyTypes').ApplicationReadiness>>(
      `${BASE}/${offerUuid}/readiness`,
    );
    return res.data.data!;
  },

  offerMatch: async (offerUuid: string) => {
    const res = await apiClient.get<ApiEnvelope<import('../../student/internship_offers/types/journeyTypes').OfferMatchDetail>>(
      `${BASE}/${offerUuid}/match`,
    );
    return res.data.data!;
  },
};
