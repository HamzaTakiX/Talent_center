import apiClient from '../../../../shared/api/client';
import type {
  InterviewAnswerResponse,
  InterviewHubStats,
  InterviewSessionCompleteResponse,
  InterviewSessionDetailResponse,
  InterviewSessionListItem,
  InterviewSessionStartResponse,
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
const INTERVIEW_BASE = '/cv-intelligence/interviews/sessions';
const INTERVIEW_STT_BASE = '/cv-intelligence/interviews/stt';

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

export async function startInterviewSession(payload: {
  mode: 'profile' | 'offer';
  offer_uuid?: string;
  external_offer_url?: string;
  external_offer?: Record<string, unknown>;
  difficulty?: 'easy' | 'medium' | 'hard';
  duration_minutes?: number;
  language?: string;
  communication_mode?: 'text' | 'voice' | 'voice_text';
  interview_type?: 'hr' | 'technical' | 'behavioral' | 'case_study' | 'mixed';
  recruiter_profile?: string;
}): Promise<InterviewSessionStartResponse> {
  const res = await apiClient.post<Envelope<InterviewSessionStartResponse>>(
    `${INTERVIEW_BASE}/start/`,
    payload,
  );
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Interview session start failed');
  }
  return res.data.data;
}

export async function submitInterviewAnswer(
  sessionUuid: string,
  payload: { question_uuid?: string; answer: string },
): Promise<InterviewAnswerResponse> {
  const res = await apiClient.post<Envelope<InterviewAnswerResponse>>(
    `${INTERVIEW_BASE}/${sessionUuid}/answer/`,
    payload,
  );
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Interview answer submission failed');
  }
  return res.data.data;
}

export async function completeInterviewSession(
  sessionUuid: string,
): Promise<InterviewSessionCompleteResponse> {
  const res = await apiClient.post<Envelope<InterviewSessionCompleteResponse>>(
    `${INTERVIEW_BASE}/${sessionUuid}/complete/`,
  );
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Interview completion failed');
  }
  return res.data.data;
}

export async function listInterviewSessions(): Promise<InterviewSessionListItem[]> {
  const res = await apiClient.get<Envelope<InterviewSessionListItem[]>>(`${INTERVIEW_BASE}/`);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Interview history load failed');
  }
  return res.data.data;
}

export async function fetchInterviewHubStats(): Promise<InterviewHubStats> {
  const res = await apiClient.get<Envelope<InterviewHubStats>>(`${INTERVIEW_BASE}/hub-stats/`);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Interview stats load failed');
  }
  return res.data.data;
}

export async function getInterviewSessionDetail(
  sessionUuid: string,
): Promise<InterviewSessionDetailResponse> {
  const res = await apiClient.get<Envelope<InterviewSessionDetailResponse>>(
    `${INTERVIEW_BASE}/${sessionUuid}/`,
  );
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || 'Interview session load failed');
  }
  return res.data.data;
}

export async function transcribeInterviewAudio(
  audioBlob: Blob,
  options?: { language?: string; filename?: string },
): Promise<{ text: string; provider?: string; model?: string }> {
  const form = new FormData();
  const filename = options?.filename || 'interview-answer.webm';
  form.append('audio', audioBlob, filename);
  if (options?.language) {
    form.append('language', options.language);
  }
  const maxAttempts = 2;
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const res = await apiClient.post<Envelope<{ text: string; provider?: string; model?: string }>>(
        `${INTERVIEW_STT_BASE}/transcribe/`,
        form,
      );
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || 'Audio transcription failed');
      }
      return res.data.data;
    } catch (error: unknown) {
      lastError = error;
      const ax = error as { response?: { status?: number } };
      const statusCode = ax.response?.status;
      const retryable = !statusCode || statusCode >= 500;
      if (!retryable || attempt >= maxAttempts) {
        break;
      }
      await new Promise((resolve) => {
        window.setTimeout(resolve, 700);
      });
    }
  }
  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error('Audio transcription failed');
}
