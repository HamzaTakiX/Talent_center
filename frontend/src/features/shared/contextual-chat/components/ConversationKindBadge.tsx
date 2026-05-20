import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatContextKind } from '../../../admin/shared/admin-module-chat/adminChatTypes';

const KIND_CLASS: Record<ChatContextKind, string> = {
  workflow_thread: 'ctx-chat-badge--workflow',
  channel: 'ctx-chat-badge--channel',
  direct: 'ctx-chat-badge--direct',
  announcement_thread: 'ctx-chat-badge--announcement',
  meeting_thread: 'ctx-chat-badge--meeting',
};

export const ConversationKindBadge: FunctionComponent<{ kind?: ChatContextKind }> = ({ kind }) => {
  const { t } = useTranslation();
  if (!kind) return null;
  return (
    <span className={`ctx-chat-badge ${KIND_CLASS[kind] ?? ''}`}>
      {t(`admin.contextualChat.kind.${kind}`, kind)}
    </span>
  );
};
