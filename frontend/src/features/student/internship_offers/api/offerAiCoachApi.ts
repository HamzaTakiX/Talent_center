import apiClient from '../../../../shared/api/client';
import type {
  OfferComparisonData,
  OfferInterviewEvaluation,
  OfferInterviewSession,
} from '../types/offerAiCoach';

interface Envelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

const BASE = '/cv-intelligence/offers';

export async function fetchOfferComparison(offerId: string): Promise<OfferComparisonData> {
  const res = await apiClient.get<Envelope<OfferComparisonData>>(
    `${BASE}/${offerId}/comparison/`,
  );
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Offer comparison failed');
  }
  return res.data.data;
}

export async function startOfferInterviewSession(
  offerId: string,
  options?: { questionCount?: number; lang?: string },
): Promise<OfferInterviewSession> {
  const res = await apiClient.post<Envelope<OfferInterviewSession>>(
    `${BASE}/${offerId}/interview/start/`,
    {
      question_count: options?.questionCount ?? 5,
      lang: options?.lang ?? 'fr',
    },
  );
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Interview session failed');
  }
  return res.data.data;
}

export async function evaluateOfferInterviewAnswer(
  offerId: string,
  payload: {
    question: { id: string; text: string; category?: string; hint?: string };
    answer: string;
    lang?: string;
  },
): Promise<OfferInterviewEvaluation> {
  const res = await apiClient.post<Envelope<OfferInterviewEvaluation>>(
    `${BASE}/${offerId}/interview/evaluate/`,
    {
      question: payload.question,
      answer: payload.answer,
      lang: payload.lang ?? 'fr',
    },
  );
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Answer evaluation failed');
  }
  return res.data.data;
}

export async function fetchOfferComparisonSafe(
  offerId: string,
): Promise<{ ok: true; data: OfferComparisonData } | { ok: false; error: string }> {
  try {
    const data = await fetchOfferComparison(offerId);
    return { ok: true, data };
  } catch (err: unknown) {
    const ax = err as { response?: { data?: Envelope<unknown> }; message?: string };
    return { ok: false, error: ax.response?.data?.message || ax.message || 'Comparison failed' };
  }
}
