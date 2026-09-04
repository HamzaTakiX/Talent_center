import apiClient from '../../../../shared/api/client';
import type { ApiEnvelope } from '../../../admin/api/types';
import type { AnalyzePageRequest, PageAnalysisResult } from '../types/pageAnalysis';

const BASE = '/report-reviewer';

export async function analyzeReportPage(
  payload: AnalyzePageRequest,
): Promise<PageAnalysisResult> {
  const { data } = await apiClient.post<ApiEnvelope<PageAnalysisResult>>(
    `${BASE}/analyze-page/`,
    payload,
    // backend Ollama timeout peut aller jusqu'à ~180s
    { timeout: 240_000 },
  );
  if (!data?.success || !data.data) {
    const message = data?.message || 'Impossible d\'analyser cette page.';
    throw new Error(message);
  }
  return data.data;
}
