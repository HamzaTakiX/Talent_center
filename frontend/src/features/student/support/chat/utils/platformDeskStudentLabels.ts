import type { TFunction } from 'i18next';

const ROLE_LABEL_KEYS: Record<string, string> = {
  Administrateur: 'student.support.chat.labels.adminRole',
  Encadrant: 'student.support.chat.labels.supervisorRole',
};

const ENTITY_LABEL_KEYS: Record<string, string> = {
  'Messagerie étudiant': 'student.support.chat.labels.studentMessagingService',
  'Coordination administrateurs': 'student.support.chat.labels.adminCoordinationService',
  'Messagerie encadrant': 'student.support.chat.labels.supervisorMessagingService',
};

export function resolveStudentPlatformDeskRoleLabel(
  roleLabel: string | undefined,
  t: TFunction,
): string | undefined {
  if (!roleLabel?.trim()) return undefined;
  const key = ROLE_LABEL_KEYS[roleLabel.trim()];
  return key ? t(key) : roleLabel;
}

export function resolveStudentPlatformDeskEntityLabel(
  entityLabel: string | undefined,
  t: TFunction,
): string | undefined {
  if (!entityLabel?.trim()) return undefined;
  const key = ENTITY_LABEL_KEYS[entityLabel.trim()];
  return key ? t(key) : entityLabel;
}
