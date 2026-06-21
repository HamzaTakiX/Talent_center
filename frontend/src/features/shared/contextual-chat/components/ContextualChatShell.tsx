import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type { AdminChatChannel } from '../../../admin/i18n/useAdminCopy';

import { useAdminChatChannel, useChatEmptyState } from '../../../admin/i18n/useAdminCopy';

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

import '../styles/contextual-chat.css';

import { OFFER_FIELD_LIMITS } from '../../../../design-system/safeContent';



export interface ContextualChatShellProps {

  module: ChatModule;

  channel: AdminChatChannel;

  mockParticipants?: AdminChatParticipant[];

  mockMessages?: Record<string, AdminChatMessage[]>;

  enableApi?: boolean;

}



const EMPTY_PARTICIPANTS: AdminChatParticipant[] = [];

const EMPTY_MESSAGES: Record<string, AdminChatMessage[]> = {};



const ContextualChatShellInner: FunctionComponent<ContextualChatShellProps> = ({

  module,

  channel,

  mockParticipants = EMPTY_PARTICIPANTS,

  mockMessages = EMPTY_MESSAGES,

  enableApi = true,

}) => {

  const { t } = useTranslation();

  const toast = useAdminToast();

  const chatCopy = useAdminChatChannel(channel);

  const emptyState = useChatEmptyState(channel);

  const [selectedId, setSelectedId] = useState('');



  const {

    loading,

    dataSource,

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

    if (selectedId && dataSource === 'live') {

      void loadMessages(selectedId);

    }

  }, [selectedId, dataSource, loadMessages]);



  const activeParticipant = selectedParticipant(selectedId);

  const activeConv = selectedConversation(selectedId) ?? null;



  const handleSelect = useCallback(

    (id: string) => {

      setSelectedId(id);

      void loadMessages(id);

    },

    [loadMessages]

  );



  const handleSend = useCallback(

    async (text: string, convId: string) => {

      const ok = await sendMessage(convId, text);

      if (ok) toast.showToast(t('admin.contextualChat.messageSent'), 'success');

      return ok;

    },

    [sendMessage, toast, t]

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

      if (selectedId) void loadMessages(selectedId);

    },

    Boolean(selectedId)

  );



  const topBanner = useMemo(() => {

    if (loading) {

      return (

        <div className="ctx-chat-loading-bar shrink-0" role="status" aria-live="polite">

          <span>{t('admin.contextualChat.loading')}</span>

        </div>

      );

    }

    return null;

  }, [loading, t]);



  const resolvedEmptyState = useMemo(() => {

    if (dataSource === 'live_empty') {

      return {

        ...emptyState,

        title: t('admin.contextualChat.noThreadsYet'),

        description: t('admin.contextualChat.emptyLiveDescription'),

      };

    }

    return emptyState;

  }, [dataSource, emptyState, t]);



  return (

    <AdminModuleChat

      participantsSeed={participants}

      initialMessages={messagesByConv}

      participantSubtitle={chatCopy.participantSubtitle}

      searchPlaceholder={chatCopy.searchPlaceholder}

      composerPlaceholder={chatCopy.composerPlaceholder}

      composerMaxLength={

        module === 'offers' ? OFFER_FIELD_LIMITS.chatMessage : undefined

      }

      chatEmptyState={resolvedEmptyState}

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

          disabled={!selectedId}

          onAction={(code) => void handleSmartAction(code)}

        />

      }

      selectedConversationId={selectedId}

      onSelectConversation={handleSelect}

      onSendMessage={handleSend}

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

