import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminChatChannel } from '../../../admin/i18n/useAdminCopy';
import { useAdminChatChannel } from '../../../admin/i18n/useAdminCopy';
import AdminModuleChat from '../../../admin/shared/admin-module-chat/AdminModuleChat';
import type {
  AdminChatMessage,
  AdminChatParticipant,
} from '../../../admin/shared/admin-module-chat/adminChatTypes';
import { useAdminToast } from '../../../admin/dashboard/context/AdminToastContext';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { useContextualChat } from '../hooks/useContextualChat';
import type { ChatModule, SmartActionCode } from '../types';
import { ChatContextHeader } from './ChatContextHeader';
import { ChatContextPanel } from './ChatContextPanel';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { ChatSmartActionsBar } from './ChatSmartActionsBar';
import { ConversationKindBadge } from './ConversationKindBadge';
import { buildMockConversation } from '../utils/buildMockConversation';
import '../styles/contextual-chat.css';

export interface ContextualChatShellProps {
  module: ChatModule;
  channel: AdminChatChannel;
  mockParticipants: AdminChatParticipant[];
  mockMessages: Record<string, AdminChatMessage[]>;
  enableApi?: boolean;
}

const ContextualChatShellInner: FunctionComponent<ContextualChatShellProps> = ({
  module,
  channel,
  mockParticipants,
  mockMessages,
  enableApi = true,
}) => {
  const { t } = useTranslation();
  const toast = useAdminToast();
  const chatCopy = useAdminChatChannel(channel);
  const [selectedId, setSelectedId] = useState('');

  const {
    loading,
    dataSource,
    usingMock,
    participants,
    messagesByConv,
    loadMessages,
    sendMessage,
    runSmartAction,
    selectedConversation,
    selectedParticipant,
  } = useContextualChat({
    module,
    mockParticipants,
    mockMessages,
    enableApi,
  });

  useEffect(() => {
    if (participants.length === 0) {
      setSelectedId('');
      return;
    }
    if (!participants.some((p) => p.id === selectedId)) {
      setSelectedId(participants[0].id);
    }
  }, [participants, selectedId]);

  useEffect(() => {
    if (selectedId && !usingMock && dataSource === 'live') {
      void loadMessages(selectedId);
    }
  }, [selectedId, usingMock, dataSource, loadMessages]);

  const activeParticipant = selectedParticipant(selectedId);
  const activeConv =
    selectedConversation(selectedId) ??
    (usingMock && activeParticipant ? buildMockConversation(activeParticipant, module) : null);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      void loadMessages(id);
    },
    [loadMessages]
  );

  const handleSend = useCallback(
    async (text: string, convId: string) => {
      if (usingMock) return false;
      const ok = await sendMessage(convId, text);
      if (ok) toast.showToast(t('admin.contextualChat.messageSent'), 'success');
      return ok;
    },
    [usingMock, sendMessage, toast, t]
  );

  const handleSmartAction = useCallback(
    async (code: SmartActionCode) => {
      if (!selectedId) return;
      const ok = await runSmartAction(selectedId, code);
      if (ok) {
        toast.showToast(t('admin.contextualChat.actionApplied', { action: code }), 'success');
        void loadMessages(selectedId);
      }
    },
    [selectedId, runSmartAction, toast, t, loadMessages]
  );

  useChatRealtime(
    selectedId,
    () => {
      if (selectedId && !usingMock) void loadMessages(selectedId);
    },
    Boolean(selectedId && !usingMock)
  );

  const topBanner = useMemo(() => {
    if (loading) {
      return (
        <div className="ctx-chat-loading-bar shrink-0" role="status" aria-live="polite">
          <span>{t('admin.contextualChat.loading')}</span>
        </div>
      );
    }
    if (usingMock) {
      return (
        <p className="ctx-chat-demo-banner shrink-0 px-4 py-1.5 text-center text-xs text-amber-600 dark:text-amber-400">
          {t('admin.contextualChat.demoMode')}
        </p>
      );
    }
    if (dataSource === 'live_empty') {
      return (
        <p className="ctx-chat-demo-banner shrink-0 px-4 py-1.5 text-center text-xs text-[var(--admin-text-muted)]">
          {t('admin.contextualChat.emptyLive', { module })}
        </p>
      );
    }
    if (dataSource === 'live') {
      return (
        <p className="ctx-chat-live-banner shrink-0 px-4 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-brand)]">
          {t('admin.contextualChat.liveConnected')}
        </p>
      );
    }
    return null;
  }, [loading, usingMock, dataSource, module, t]);

  return (
    <AdminModuleChat
      participantsSeed={participants}
      initialMessages={messagesByConv}
      participantSubtitle={chatCopy.participantSubtitle}
      searchPlaceholder={chatCopy.searchPlaceholder}
      composerPlaceholder={chatCopy.composerPlaceholder}
      emptyConversationLabel={
        dataSource === 'live_empty'
          ? t('admin.contextualChat.noThreadsYet')
          : chatCopy.emptyConversationLabel
      }
      topBanner={topBanner}
      contextHeader={
        <ChatContextHeader
          conversation={activeConv ?? null}
          participantTitle={activeParticipant?.title}
        />
      }
      rightPanel={<ChatContextPanel conversation={activeConv ?? null} />}
      smartActionsBar={
        <ChatSmartActionsBar
          disabled={!selectedId || usingMock}
          onAction={(code) => void handleSmartAction(code)}
        />
      }
      selectedConversationId={selectedId}
      onSelectConversation={handleSelect}
      onSendMessage={usingMock ? undefined : handleSend}
      renderConversationBadge={(p) =>
        p.contextKind ? <ConversationKindBadge kind={p.contextKind} /> : null
      }
      renderListMeta={(p) =>
        p.urgency && p.urgency !== 'NONE' ? (
          <span className={`ctx-chat-list-urgency ctx-chat-list-urgency--${p.urgency.toLowerCase()}`} />
        ) : null
      }
    />
  );
};

const ContextualChatShell: FunctionComponent<ContextualChatShellProps> = (props) => (
  <ChatErrorBoundary>
    <ContextualChatShellInner {...props} />
  </ChatErrorBoundary>
);

export default ContextualChatShell;
