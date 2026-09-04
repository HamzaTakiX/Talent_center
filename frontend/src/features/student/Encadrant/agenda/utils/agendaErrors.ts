import axios from 'axios';

import type { AgendaConflict } from '../types';

interface ErrorEnvelope {
  message?: string;
  errors?: Record<string, unknown>;
}

export interface AgendaRequestError {
  status: number | null;
  message: string;
  /** Populated on 409 so the caller can offer "schedule anyway". */
  conflicts: AgendaConflict[] | null;
}

/**
 * Turns any thrown value into something displayable.
 *
 * Falls back to the caller's copy rather than surfacing an axios/network string,
 * and never digs into a stack trace.
 */
export function toAgendaError(error: unknown, fallback: string): AgendaRequestError {
  if (!axios.isAxiosError(error)) {
    return { status: null, message: fallback, conflicts: null };
  }

  const status = error.response?.status ?? null;
  const payload = error.response?.data as ErrorEnvelope | undefined;
  const fieldErrors = payload?.errors;

  let message = payload?.message || fallback;
  if (fieldErrors && typeof fieldErrors === 'object') {
    const first = Object.values(fieldErrors).find(
      (value) => Array.isArray(value) && value.length > 0,
    );
    if (Array.isArray(first) && typeof first[0] === 'string') {
      message = first[0];
    }
  }

  let conflicts: AgendaConflict[] | null = null;
  const raw = (fieldErrors as { conflicts?: unknown } | undefined)?.conflicts;
  if (status === 409 && Array.isArray(raw)) {
    conflicts = raw.map((item) => {
      const c = item as Record<string, unknown>;
      return {
        userId: Number(c.user_id ?? 0),
        eventId: String(c.event_id ?? ''),
        title: String(c.title ?? ''),
        eventType: String(c.event_type ?? 'OTHER') as AgendaConflict['eventType'],
        start: String(c.start ?? ''),
        end: String(c.end ?? ''),
        blocking: Boolean(c.blocking),
      };
    });
  }

  return { status, message, conflicts };
}

export function isAbort(error: unknown): boolean {
  return axios.isCancel(error) || (error as { name?: string })?.name === 'CanceledError';
}
