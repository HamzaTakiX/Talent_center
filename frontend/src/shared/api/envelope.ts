import type { ApiEnvelope } from '../../features/admin/api/types';

type ApiError = Error & { response?: { data: ApiEnvelope<unknown> } };

/** Throws an axios-compatible error when an envelope response is not successful. */
export function requireEnvelopeData<T>(body: ApiEnvelope<T>, fallbackMessage: string): T {
  if (body.success && body.data) {
    return body.data;
  }

  const error = new Error(body.message || fallbackMessage) as ApiError;
  error.response = { data: body };
  throw error;
}
