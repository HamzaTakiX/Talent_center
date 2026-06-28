import type { TFunction } from 'i18next';

export type DocumentRequestErrorKind = 'pending' | 'generic';

const ERROR_RULES: Array<{
  match: (message: string) => boolean;
  key: string;
  kind?: DocumentRequestErrorKind;
}> = [
  {
    match: (message) => message.includes('pending request already exists'),
    key: 'student.documents.errors.pendingRequestExists',
    kind: 'pending',
  },
  {
    match: (message) =>
      message.includes('document not available') || message.includes('not found'),
    key: 'student.documents.errors.documentNotAvailable',
  },
  {
    match: (message) => message.includes('online request is not enabled'),
    key: 'student.documents.errors.onlineRequestDisabled',
  },
  {
    match: (message) => message.includes('student profile required'),
    key: 'student.documents.errors.studentProfileRequired',
  },
  {
    match: (message) =>
      message.includes('session not found')
      || message.includes('session has been revoked')
      || message.includes('session has expired')
      || message.includes('authentication required'),
    key: 'student.documents.errors.sessionExpired',
  },
];

export function resolveDocumentRequestError(
  message: string,
  t: TFunction,
): { message: string; kind: DocumentRequestErrorKind } {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return { message: t('student.documents.errors.submitFailed'), kind: 'generic' };
  }

  const rule = ERROR_RULES.find(({ match }) => match(normalized));
  if (rule) {
    return { message: t(rule.key), kind: rule.kind ?? 'generic' };
  }

  return { message, kind: 'generic' };
}

/** @deprecated Use resolveDocumentRequestError */
export function mapDocumentRequestError(message: string, t: TFunction): string {
  return resolveDocumentRequestError(message, t).message;
}
