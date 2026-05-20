import apiClient from '../../../shared/api/client';
import type { MultilingualBuilderAnalysis } from '../types/cvAiAnalysis';
import type { CvValidationIssue } from '../validation/cvBuilderValidation';

export interface AnalysisConfig {
  provider: string;
  model: string | null;
  ai_available: boolean;
  requires_api_key: boolean;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export async function fetchAnalysisConfig(): Promise<AnalysisConfig> {
  const res = await apiClient.get<Envelope<AnalysisConfig>>('/cv/builder/analysis-config/');
  return res.data.data!;
}

export async function analyzeCvBuilder(
  cv: Record<string, unknown>,
): Promise<MultilingualBuilderAnalysis> {
  const res = await apiClient.post<Envelope<MultilingualBuilderAnalysis>>('/cv/builder/analyze/', {
    cv,
  });
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Analysis failed');
  }
  return res.data.data;
}

export async function analyzeCvBuilderSafe(
  cv: Record<string, unknown>,
): Promise<
  | { ok: true; result: MultilingualBuilderAnalysis }
  | { ok: false; validationIssues: CvValidationIssue[] }
  | { ok: false; configError: string }
  | { ok: false; error: string }
> {
  try {
    const result = await analyzeCvBuilder(cv);
    return { ok: true, result };
  } catch (err: unknown) {
    const ax = err as {
      response?: { status?: number; data?: Envelope<{ validation_issues?: CvValidationIssue[] }> };
      message?: string;
    };
    const status = ax.response?.status;
    const body = ax.response?.data;

    if (status === 422 && body?.data?.validation_issues) {
      return { ok: false, validationIssues: body.data.validation_issues };
    }
    if (status === 503) {
      return {
        ok: false,
        configError:
          body?.message ||
          'AI is not configured. Set ANTHROPIC_API_KEY and CV_ANALYSIS_PROVIDER=claude in backend .env.',
      };
    }
    return { ok: false, error: body?.message || ax.message || 'Analysis failed' };
  }
}
