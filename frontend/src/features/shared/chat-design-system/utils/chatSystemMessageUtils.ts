import type { TFunction } from 'i18next';

/** Smart actions that are admin-inbox only and must not appear in the student chat. */
export const STUDENT_HIDDEN_SMART_ACTIONS = new Set([
  'archive_conversation',
  'unarchive_conversation',
  'assign_admin',
  'add_internal_note',
  'set_priority',
  'notify_admin',
  'mark_urgent',
  'escalate',
]);

export type ChatSystemMessageInput = {
  text: string;
  messageType?: string;
  smartActionCode?: string;
};

export type FormatChatSystemMessageOptions = {
  inboxMode: 'admin' | 'student';
  /** Optional module-specific i18n prefix, e.g. admin.modules.offers.inbox.systemEvents */
  systemEventsPrefix?: string;
};

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

function resolveSystemEventLabel(
  actionCode: string,
  inboxMode: 'admin' | 'student',
  systemEventsPrefix: string | undefined,
  t: TFunction,
): string {
  const candidates = [
    systemEventsPrefix ? `${systemEventsPrefix}.${actionCode}` : null,
    inboxMode === 'admin'
      ? `admin.chat.systemEvents.${actionCode}`
      : `student.chat.systemEvents.${actionCode}`,
    inboxMode === 'admin'
      ? `admin.modules.offers.inbox.systemEvents.${actionCode}`
      : `student.internshipOffers.chat.systemEvents.${actionCode}`,
  ].filter(Boolean) as string[];

  for (const key of candidates) {
    const label = t(key, { defaultValue: '' });
    if (label) return label;
  }

  return humanizeActionCode(actionCode);
}

/** Shared workflow/system event formatter for all contextual chat modules. */
export function formatChatSystemMessage(
  msg: ChatSystemMessageInput,
  options: FormatChatSystemMessageOptions,
  t: TFunction,
): string | null {
  if (msg.messageType !== 'EVENT' && msg.messageType !== 'SYSTEM') {
    return null;
  }

  const actionCode = msg.smartActionCode ?? parseSmartActionCode(msg.text);
  if (actionCode) {
    if (shouldHideSmartActionForInbox(actionCode, options.inboxMode)) {
      return null;
    }
    return resolveSystemEventLabel(actionCode, options.inboxMode, options.systemEventsPrefix, t);
  }

  if (/^\[Action:/i.test(msg.text.trim())) {
    return null;
  }

  return msg.text;
}
