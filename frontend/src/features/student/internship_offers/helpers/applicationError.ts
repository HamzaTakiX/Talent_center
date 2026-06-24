import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';

const DUPLICATE_APPLICATION_PATTERN = /already have an active application/i;
const OFFER_NOT_OPEN_PATTERN = /not open for applications/i;
const OFFER_EXPIRED_PATTERN = /has expired/i;

export type ApplicationSubmitErrorCode =
  | 'duplicate'
  | 'offer_not_applyable'
  | 'offer_expired'
  | 'unknown';

/** True when the student already has an active application for this offer. */
export function isDuplicateApplicationError(err: unknown): boolean {
  return classifyApplicationSubmitError(err) === 'duplicate';
}

export function classifyApplicationSubmitError(err: unknown): ApplicationSubmitErrorCode {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status !== 409) return 'unknown';

  const { message } = parseAdminApiError(err, '');
  if (DUPLICATE_APPLICATION_PATTERN.test(message)) return 'duplicate';
  if (OFFER_EXPIRED_PATTERN.test(message)) return 'offer_expired';
  if (OFFER_NOT_OPEN_PATTERN.test(message)) return 'offer_not_applyable';
  return 'unknown';
}
