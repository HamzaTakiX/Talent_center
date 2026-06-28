import type { TFunction } from 'i18next';

type LoginErrorPayload = {
  message?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
};

const GENERIC_API_MESSAGES = new Set([
  'authentication required',
  'permission denied',
  'validation failed',
]);

export function extractLoginBackendMessage(data: LoginErrorPayload | undefined): string {
  if (!data) return '';

  const detail = data.errors?.detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return String(detail[0]);
  }
  if (typeof detail === 'string') {
    return detail;
  }
  if (typeof data.detail === 'string') {
    return data.detail;
  }
  if (typeof data.message === 'string' && !GENERIC_API_MESSAGES.has(data.message.toLowerCase())) {
    return data.message;
  }
  if (typeof data.message === 'string') {
    return data.message;
  }
  return '';
}

export function resolveLoginAccessMessage(backendMessage: string, t: TFunction): string {
  const msg = backendMessage.toLowerCase().trim();

  if (!msg || msg === 'authentication required') {
    return t('auth.login.errors.authMessage');
  }
  if (msg.includes('invalid credentials')) {
    return t('auth.login.errors.authMessage');
  }
  if (msg.includes('pending')) {
    return t('auth.login.errors.pendingMessage');
  }
  if (msg.includes('suspended')) {
    return t('auth.login.errors.suspendedMessage');
  }
  if (msg.includes('blocked')) {
    return t('auth.login.errors.blockedMessage');
  }
  if (msg.includes('archived')) {
    return t('auth.login.errors.archivedMessage');
  }
  if (msg.includes('platform access') || msg.includes('not been granted')) {
    return t('auth.login.errors.platformAccessMessage');
  }
  if (msg.includes('disabled') || msg.includes('deactivated') || msg.includes('not active')) {
    return t('auth.login.errors.disabledMessage');
  }
  if (msg.includes('not authorized')) {
    return t('auth.login.errors.deniedMessage');
  }

  return backendMessage || t('auth.login.errors.deniedMessage');
}

export function getLoginErrorMessage(
  err: { response?: { status?: number; data?: LoginErrorPayload } },
  t: TFunction,
): string {
  if (!err.response) {
    return t('auth.login.errors.connectionMessage');
  }

  const { status, data } = err.response;
  const backendMessage = extractLoginBackendMessage(data);

  switch (status) {
    case 400:
      if (data?.errors) {
        const fieldErrors = Object.entries(data.errors)
          .filter(([key]) => key !== 'detail')
          .map(([, msgs]) => `${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ');
        if (fieldErrors) return fieldErrors;
      }
      return backendMessage || t('auth.login.errors.validationMessage');

    case 401:
    case 403:
      return resolveLoginAccessMessage(backendMessage, t);

    case 423:
      return t('auth.login.errors.lockedMessage');

    case 429:
      return t('auth.login.errors.rateLimitMessage');

    case 500:
    case 502:
    case 503:
    case 504:
      return t('auth.login.errors.serverMessage');

    default:
      return backendMessage || t('auth.login.errors.failedMessage');
  }
}
