export interface ParsedAdminApiError {
  message: string;
  fieldErrors: Record<string, string>;
  /**
   * Machine-readable code from `errors.code` (see `apps/stage/views.py`).
   * Lets the caller localize instead of printing the server's English wording.
   */
  code?: string;
}

const firstMessage = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

/** Normalizes DRF / envelope API errors for admin forms. */
export function parseAdminApiError(err: unknown, fallback: string): ParsedAdminApiError {
  const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
  const fieldErrors: Record<string, string> = {};

  let code: string | undefined;

  if (data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    for (const [key, val] of Object.entries(data.errors as Record<string, unknown>)) {
      const msg = firstMessage(val);
      if (!msg) continue;
      // `code` is the error identifier, not a form field.
      if (key === 'code') code = msg;
      else fieldErrors[key] = msg;
    }
  }

  const message =
    (typeof data?.message === 'string' && data.message) ||
    firstMessage(data?.detail) ||
    Object.values(fieldErrors)[0] ||
    fallback;

  return { message, fieldErrors, code };
}
