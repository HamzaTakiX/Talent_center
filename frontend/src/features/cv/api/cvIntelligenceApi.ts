import apiClient from '../../../shared/api/client';
import type { CvAnalysisDashboardData, CvAnalysisStatus, CvInternshipMatch } from '../../student/internship_offers/CV_Analyse/types/cvAnalysisDashboard';

interface Envelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface CvIntelligenceConfig {
  provider: string;
  model: string | null;
  fallback_model: string;
  ai_available: boolean;
  ollama_available: boolean;
  available_models: string[];
}

export interface CvIntelligenceAnalyzeResponse {
  report: Record<string, unknown>;
  dashboard: CvAnalysisDashboardData;
  status: CvAnalysisStatus;
  current_cv_hash?: string;
  analyzed_cv_hash?: string | null;
  analysis_version?: number | null;
}

export interface CvIntelligenceDashboardResponse {
  dashboard: CvAnalysisDashboardData | null;
  report: Record<string, unknown> | null;
  status: CvAnalysisStatus;
  current_cv_hash?: string;
  analyzed_cv_hash?: string | null;
  analysis_version?: number | null;
}

export interface CvIntelligenceReportSummary {
  uuid: string;
  source_type: string;
  status: string;
  provider: string;
  global_score: number;
  potential_score: number;
  score_delta: number | null;
  detected_languages: string[];
  analyzed_at: string;
  cv_hash?: string;
  version?: number;
  is_active?: boolean;
}

const BASE = '/cv-intelligence';

export async function fetchCvIntelligenceConfig(): Promise<CvIntelligenceConfig> {
  const res = await apiClient.get<Envelope<CvIntelligenceConfig>>(`${BASE}/config/`);
  return res.data.data!;
}

export async function analyzeCvIntelligence(
  cv: Record<string, unknown>,
  options?: { force?: boolean },
): Promise<CvIntelligenceAnalyzeResponse> {
  const res = await apiClient.post<Envelope<CvIntelligenceAnalyzeResponse>>(`${BASE}/analyze/`, {
    cv,
    force: options?.force ?? false,
  }, {
    timeout: 300_000,
  });
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'CV Intelligence analysis failed');
  }
  return res.data.data;
}

export async function analyzeCvIntelligenceFile(
  file: File,
  options?: { force?: boolean },
): Promise<CvIntelligenceAnalyzeResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.force) {
    formData.append('force', 'true');
  }
  const res = await apiClient.post<Envelope<CvIntelligenceAnalyzeResponse>>(`${BASE}/analyze/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300_000,
  });
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'CV Intelligence file analysis failed');
  }
  return res.data.data;
}

export async function fetchCvIntelligenceInternshipMatches(
  limit?: number,
): Promise<CvInternshipMatch[]> {
  const params = limit ? { limit } : undefined;
  const res = await apiClient.get<Envelope<CvInternshipMatch[]>>(`${BASE}/internship-matches/`, {
    params,
  });
  return res.data.data ?? [];
}

export async function fetchCvIntelligenceInternshipMatchesSafe(
  limit?: number,
): Promise<CvInternshipMatch[]> {
  try {
    return await fetchCvIntelligenceInternshipMatches(limit);
  } catch {
    return [];
  }
}

export async function fetchCvIntelligenceDashboard(
  cvHash?: string,
): Promise<CvIntelligenceDashboardResponse> {
  const params = cvHash ? { cv_hash: cvHash } : undefined;
  const res = await apiClient.get<Envelope<CvIntelligenceDashboardResponse>>(`${BASE}/dashboard/`, {
    params,
  });
  return (
    res.data.data ?? {
      dashboard: null,
      report: null,
      status: 'none',
    }
  );
}

export async function fetchCvIntelligenceHistory(): Promise<CvIntelligenceReportSummary[]> {
  const res = await apiClient.get<Envelope<CvIntelligenceReportSummary[]>>(`${BASE}/reports/`);
  return res.data.data ?? [];
}

export async function compareCvIntelligenceReports(
  reportUuid: string,
  previousUuid: string,
): Promise<Record<string, unknown>> {
  const res = await apiClient.get<Envelope<Record<string, unknown>>>(
    `${BASE}/reports/${reportUuid}/compare/${previousUuid}/`,
  );
  return res.data.data ?? {};
}

export async function analyzeCvIntelligenceSafe(
  cv: Record<string, unknown>,
  options?: { force?: boolean },
): Promise<
  | {
      ok: true;
      dashboard: CvAnalysisDashboardData;
      report: Record<string, unknown>;
      status: CvAnalysisStatus;
    }
  | { ok: false; error: string }
> {
  try {
    const result = await analyzeCvIntelligence(cv, options);
    return {
      ok: true,
      dashboard: result.dashboard,
      report: result.report,
      status: result.status ?? 'up_to_date',
    };
  } catch (err: unknown) {
    const ax = err as { response?: { data?: Envelope<unknown> }; message?: string };
    return { ok: false, error: ax.response?.data?.message || ax.message || 'Analysis failed' };
  }
}

export async function analyzeCvIntelligenceFileSafe(
  file: File,
  options?: { force?: boolean },
): Promise<
  | {
      ok: true;
      dashboard: CvAnalysisDashboardData;
      report: Record<string, unknown>;
      status: CvAnalysisStatus;
    }
  | { ok: false; error: string }
> {
  try {
    const result = await analyzeCvIntelligenceFile(file, options);
    return {
      ok: true,
      dashboard: result.dashboard,
      report: result.report,
      status: result.status ?? 'up_to_date',
    };
  } catch (err: unknown) {
    const ax = err as { response?: { data?: Envelope<unknown> }; message?: string };
    return { ok: false, error: ax.response?.data?.message || ax.message || 'File analysis failed' };
  }
}

export async function fetchCvIntelligenceDashboardSafe(
  cvHash?: string,
): Promise<
  | { ok: true; response: CvIntelligenceDashboardResponse }
  | { ok: false; error: string }
> {
  try {
    const response = await fetchCvIntelligenceDashboard(cvHash);
    return { ok: true, response };
  } catch (err: unknown) {
    const ax = err as { response?: { data?: Envelope<unknown> }; message?: string };
    return { ok: false, error: ax.response?.data?.message || ax.message || 'Dashboard load failed' };
  }
}
