import type { TFunction } from 'i18next';

import type { InternshipMessage } from '../types/internshipChatTypes';

/** Smart actions that are admin-inbox only and must not appear in the student chat. */
export const STUDENT_HIDDEN_SMART_ACTIONS = new Set([
  'archive_conversation',
  'unarchive_conversation',
  'assign_admin',
  'add_internal_note',
  'set_priority',
  'notify_admin',
]);

export function parseSmartActionCode(
  body: string,
  metadata?: Record<string, unknown>,
): string | null {
  const fromMeta = metadata?.smart_action;
  if (typeof fromMeta === 'string' && fromMeta.trim()) {
    return fromMeta.trim();
  }
  const match = body.trim().match(/^\[Action:\s*([^\]]+)\]/i);
  return match?.[1]?.trim() ?? null;
}

export function shouldHideSmartActionForInbox(
  actionCode: string | null,
  inboxMode: 'admin' | 'student',
): boolean {
  if (!actionCode || inboxMode !== 'student') return false;
  return STUDENT_HIDDEN_SMART_ACTIONS.has(actionCode);
}

function humanizeActionCode(actionCode: string): string {
  return actionCode.replace(/_/g, ' ');
}

export function formatInternshipSystemMessage(
  msg: InternshipMessage,
  inboxMode: 'admin' | 'student',
  t: TFunction,
): string | null {
  if (msg.messageType !== 'EVENT' && msg.messageType !== 'SYSTEM') {
    return null;
  }

  const actionCode = msg.smartActionCode ?? parseSmartActionCode(msg.text);
  if (actionCode) {
    if (shouldHideSmartActionForInbox(actionCode, inboxMode)) {
      return null;
    }
    const i18nKey =
      inboxMode === 'admin'
        ? `admin.modules.offers.inbox.systemEvents.${actionCode}`
        : `student.internshipOffers.chat.systemEvents.${actionCode}`;
    const label = t(i18nKey, { defaultValue: '' });
    if (label) return label;
    return humanizeActionCode(actionCode);
  }

  if (/^\[Action:/i.test(msg.text.trim())) {
    return null;
  }

  return msg.text;
}
