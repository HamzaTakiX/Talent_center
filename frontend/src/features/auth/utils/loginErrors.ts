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

/** User-facing copy when a Microsoft identity is not allowed on Talent Center. */
export function getMicrosoftAccessDeniedMessage(t: TFunction): string {
  return t('auth.login.errors.microsoftAccessDeniedMessage');
}

/** Unified Talent Center access-denied copy for Microsoft SSO exchange failures. */
export function isMicrosoftAccessDeniedMessage(message: string, t: TFunction): boolean {
  return message === getMicrosoftAccessDeniedMessage(t);
}

const TALENT_CENTER_ACCESS_DENIAL_PATTERNS = [
  'no matching account',
  'platform access',
  'not been granted',
  'sso access',
  'sso has not been authorized',
  'not authorized',
  'not allowed to access',
  'not assigned',
  'does not exist in tenant',
  'need admin approval',
  'administrator has not consented',
  'admin consent',
  'unauthorized access',
  'access to this application',
  'aadsts50105',
  'aadsts50020',
  'aadsts65001',
  'aadsts700016',
] as const;

const AUTH0_LOGIN_CANCEL_PATTERNS = [
  'user cancelled',
  'user canceled',
  'the user closed',
  'user did not authorize',
  'login required',
] as const;

function isTalentCenterAccessDenial(msg: string): boolean {
  return TALENT_CENTER_ACCESS_DENIAL_PATTERNS.some((pattern) => msg.includes(pattern));
}

function isAuth0LoginCancellation(text: string): boolean {
  const msg = text.toLowerCase().trim();
  if (!msg || msg === 'access_denied') {
    return true;
  }
  return AUTH0_LOGIN_CANCEL_PATTERNS.some((pattern) => msg.includes(pattern));
}

function collectAuth0ErrorText(error: Auth0CallbackError): string {
  const description = (error as { error_description?: string }).error_description ?? '';
  return [error.error, error.message, description].filter(Boolean).join(' ');
}

/** Email/password login: keep specific account-state messages. */
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
  if (msg.includes('no matching account')) {
    return t('auth.login.errors.noMatchingAccountMessage');
  }
  if (msg.includes('sso access') || msg.includes('sso has not been authorized')) {
    return t('auth.login.errors.ssoNotAuthorizedMessage');
  }
  if (msg.includes('disabled') || msg.includes('deactivated') || msg.includes('not active')) {
    return t('auth.login.errors.disabledMessage');
  }
  if (msg.includes('not authorized')) {
    return t('auth.login.errors.deniedMessage');
  }

  return backendMessage || t('auth.login.errors.deniedMessage');
}

function isSsoTechnicalFailure(msg: string): boolean {
  return (
    msg.includes('invalid auth0 token')
    || msg.includes('auth0 token is missing required claims')
    || msg.includes('auth0 access token is required')
  );
}

/** Microsoft SSO exchange: unify registration/access denials into one clean message. */
export function resolveSsoAccessMessage(backendMessage: string, t: TFunction): string {
  const msg = backendMessage.toLowerCase().trim();

  if (!msg || msg === 'authentication required' || msg === 'permission denied') {
    return getMicrosoftAccessDeniedMessage(t);
  }
  if (isSsoTechnicalFailure(msg)) {
    return t('auth.login.errors.microsoftFailedMessage');
  }
  if (isTalentCenterAccessDenial(msg)) {
    return getMicrosoftAccessDeniedMessage(t);
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
  if (msg.includes('disabled') || msg.includes('deactivated') || msg.includes('not active')) {
    return t('auth.login.errors.disabledMessage');
  }

  return getMicrosoftAccessDeniedMessage(t);
}

type Auth0CallbackError = {
  error?: string;
  message?: string;
  error_description?: string;
};

/**
 * Safe user-facing message for Auth0 redirect/callback failures.
 * Returns null when the user cancelled Microsoft/Auth0 (Case D: silent return).
 */
export function getAuth0CallbackErrorMessage(
  error: Auth0CallbackError,
  t: TFunction,
): string | null {
  const code = (error.error ?? '').toLowerCase();
  const fullText = collectAuth0ErrorText(error).toLowerCase();

  if (code === 'access_denied') {
    if (isAuth0LoginCancellation(fullText)) {
      return null;
    }
    return getMicrosoftAccessDeniedMessage(t);
  }

  if (isTalentCenterAccessDenial(fullText)) {
    return getMicrosoftAccessDeniedMessage(t);
  }

  return t('auth.login.errors.microsoftFailedMessage');
}

export function getLoginErrorMessage(
  err: { response?: { status?: number; data?: LoginErrorPayload } },
  t: TFunction,
  options?: { source?: 'local' | 'sso' },
): string {
  if (!err.response) {
    return t('auth.login.errors.connectionMessage');
  }

  const { status, data } = err.response;
  const backendMessage = extractLoginBackendMessage(data);
  const source = options?.source ?? 'local';

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
      return source === 'sso'
        ? resolveSsoAccessMessage(backendMessage, t)
        : resolveLoginAccessMessage(backendMessage, t);

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
