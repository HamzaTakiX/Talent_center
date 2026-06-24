import apiClient from '../../../../../shared/api/client';
import { buildApiUrl } from '../../../../../shared/api/config';
import type { CoachContextData, CoachMode, CoachChatSummary } from '../types/careerCoach';
interface Envelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface CareerCoachSessionDto {
  session_id: string;
  title: string;
  mode: CoachMode;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  message_count: number;
  preview: string;
  last_role: string | null;
}

export interface CareerCoachMessageDto {
  id: number;
  role: 'user' | 'assistant' | 'system';
  message: string;
  mode: CoachMode;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CareerCoachChatResult {
  session_id: string;
  user_message_id: number;
  assistant_message_id: number;
  response: string;
  model: string;
  language_hint: string;
  rag_chunks_used: number;
}

export type CareerCoachStreamEvent =
  | { type: 'session'; session_id: string }
  | { type: 'token'; content: string }
  | {
      type: 'done';
      assistant_message_id: number;
      response: string;
      language_hint: string;
    }
  | { type: 'error'; message: string };

export interface CareerCoachContextDto {
  cv_file_name: string;
  has_cv: boolean;
  has_analysis: boolean;
  cv_score: number;
  ats_score: number;
  last_analysis: string;
  readiness_percent: number;
  focus_areas: { id: string; label?: string; label_key?: string }[];
  active_goals: { id: string; label?: string; label_key?: string; progress: number }[];
  personalized_subtitle?: string;
}

const BASE = '/career-coach';

function mapContextDto(dto: CareerCoachContextDto): CoachContextData {
  return {
    cvFileName: dto.cv_file_name,
    hasCv: dto.has_cv,
    hasAnalysis: dto.has_analysis,
    cvScore: dto.cv_score,
    atsScore: dto.ats_score,
    lastAnalysis: dto.last_analysis,
    readinessPercent: dto.readiness_percent,
    focusAreas: dto.focus_areas.map((area) => ({
      id: area.id,
      labelKey: area.label_key || area.label || '',
    })),
    activeGoals: dto.active_goals.map((goal) => ({
      id: goal.id,
      labelKey: goal.label_key || goal.label || '',
      progress: goal.progress,
    })),
  };
}

function unwrap<T>(res: { data: Envelope<T> }, fallback: string): T {
  if (!res.data.success || res.data.data === undefined) {
    throw new Error(res.data.message || fallback);
  }
  return res.data.data;
}

export async function fetchCareerCoachContext(): Promise<CoachContextData> {
  const res = await apiClient.get<Envelope<CareerCoachContextDto>>(`${BASE}/context/`);
  return mapContextDto(unwrap(res, 'Failed to load context'));
}

export async function fetchCareerCoachSessions(archived = false): Promise<CareerCoachSessionDto[]> {
  const res = await apiClient.get<Envelope<{ sessions: CareerCoachSessionDto[] }>>(`${BASE}/sessions/`, {
    params: { archived: archived ? '1' : '0' },
  });
  return unwrap(res, 'Failed to load sessions').sessions;
}

export async function createCareerCoachSession(
  mode: CoachMode = 'career-coach',
  title = '',
): Promise<CareerCoachSessionDto> {
  const res = await apiClient.post<Envelope<{ session: CareerCoachSessionDto }>>(`${BASE}/sessions/`, {
    mode,
    title,
  });
  return unwrap(res, 'Failed to create session').session;
}

export async function fetchCareerCoachHistory(sessionId: string): Promise<CareerCoachMessageDto[]> {
  const res = await apiClient.get<Envelope<{ messages: CareerCoachMessageDto[]; session_id: string }>>(
    `${BASE}/sessions/${sessionId}/`,
  );
  return unwrap(res, 'Failed to load conversation').messages;
}

export async function renameCareerCoachSession(
  sessionId: string,
  title: string,
): Promise<CareerCoachSessionDto> {
  const res = await apiClient.patch<Envelope<{ session: CareerCoachSessionDto }>>(
    `${BASE}/sessions/${sessionId}/`,
    { title },
  );
  return unwrap(res, 'Failed to rename session').session;
}

export async function setCareerCoachSessionArchived(
  sessionId: string,
  isArchived: boolean,
): Promise<CareerCoachSessionDto> {
  const res = await apiClient.patch<Envelope<{ session: CareerCoachSessionDto }>>(
    `${BASE}/sessions/${sessionId}/`,
    { is_archived: isArchived },
  );
  return unwrap(res, 'Failed to update session').session;
}

export async function deleteCareerCoachSession(sessionId: string): Promise<void> {
  const res = await apiClient.delete<Envelope<{ session_id: string }>>(`${BASE}/sessions/${sessionId}/`);
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to delete session');
  }
}

export async function fetchCareerCoachSummary(
  sessionId: string,
  refresh = false,
): Promise<CoachChatSummary> {
  const res = await apiClient.get<Envelope<CoachChatSummary>>(
    `${BASE}/sessions/${sessionId}/summary/`,
    { params: refresh ? { refresh: '1' } : undefined },
  );
  return unwrap(res, 'Failed to load summary');
}

export async function sendCareerCoachMessage(payload: {
  message: string;
  sessionId: string;
  mode: CoachMode;
}): Promise<CareerCoachChatResult> {
  const res = await apiClient.post<Envelope<CareerCoachChatResult>>(`${BASE}/chat/`, {
    message: payload.message,
    session_id: payload.sessionId,
    mode: payload.mode,
    stream: false,
  });
  return unwrap(res, 'Chat failed');
}

export async function streamCareerCoachMessage(
  payload: {
    message: string;
    sessionId: string;
    mode: CoachMode;
  },
  onEvent: (event: CareerCoachStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(buildApiUrl(`${BASE}/chat/`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message: payload.message,
      session_id: payload.sessionId,
      mode: payload.mode,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Chat failed');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Chat stream unavailable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const raw = trimmed.slice(5).trim();
      if (!raw) continue;
      try {
        onEvent(JSON.parse(raw) as CareerCoachStreamEvent);
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
