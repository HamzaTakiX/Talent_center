import { FunctionComponent, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../shared/admin-support-inbox/components/SupportMessageComposer';
import { useChatEmptyState } from '../../../i18n/useAdminCopy';
import {
  InternshipChatMessagesSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import InternshipStudentAvatar from '../../../offres-stage/chat/components/InternshipStudentAvatar';
import {
  StandardChatMessageThread,
  toChatToolMessages,
  useChatConversationTools,
} from '../../../../shared/chat-design-system';
import ChatComposerModuleExtras from '../../../../shared/contextual-chat/components/ChatComposerModuleExtras';
import { useSupportChatAreaComposer } from '../../../../shared/contextual-chat/hooks/useSupportChatAreaComposer';
import type { ChatEntityReference } from '../../../../shared/contextual-chat/types/chatEntityTypes';
import type { AdminSrfConversation, InboxStats } from '../types/adminSrfChatTypes';

type Props = {
  conversation: AdminSrfConversation | null;
  stats: InboxStats;
  messagesLoading?: boolean;
  conversationLoading?: boolean;
  statsLoading?: boolean;
  onSend: (text: string, tagCodes?: string[], entityRefs?: ChatEntityReference[]) => void;
  onBack?: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
};

const AdminSrfChatThread: FunctionComponent<Props> = ({
  conversation,
  stats,
  messagesLoading = false,
  conversationLoading = false,
  statsLoading = false,
  onSend,
  onBack,
  onArchive,
  onUnarchive,
}) => {
  const { t } = useTranslation();
  const emptyState = useChatEmptyState('srf');
  const scrollRef = useRef<HTMLDivElement>(null);
  const composer = useSupportChatAreaComposer(conversation?.id, (text, _files, tagCodes, entityRefs) => {
    onSend(text, tagCodes, entityRefs);
  });

  const messages = conversation?.messages ?? [];
  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(messages),
    conversationKey: conversation?.id ?? '',
    counterpartyName: conversation?.studentName,
    archived: conversation?.archived,
    onArchive,
    onUnarchive,
    scrollContainerRef: scrollRef,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, conversation?.id, chatTools.searchQuery]);

  if ((conversationLoading || messagesLoading) && !conversation) {
    return <InternshipChatWorkspaceSkeleton />;
  }

  if (!conversation) {
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState
          {...emptyState}
          statsLoading={statsLoading}
          stats={{
            unread: stats.unread,
            pending: stats.pending,
            resolved: stats.resolved,
          }}
        />
      </section>
    );
  }

  return (
    <section className="isi-chat">
      <header className="isi-chat-header">
        <div className="isi-chat-header-left">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="isi-icon-btn lg:hidden"
              aria-label={t('admin.chat.backToList', { defaultValue: 'Retour à la liste' })}
            >
              <ArrowLeft className="size-5" strokeWidth={2} />
            </button>
          ) : null}
          <div className="isi-chat-header-main min-w-0">
            <div className="isi-chat-header-identity">
              <InternshipStudentAvatar
                url={conversation.studentAvatarUrl}
                name={conversation.studentName}
                email={conversation.studentEmail}
                initials={conversation.studentInitials}
                size="header"
              />
              <h2 className="isi-chat-name truncate">{conversation.studentName}</h2>
            </div>
            <p className="isi-chat-meta truncate">{conversation.statusLabel}</p>
          </div>
        </div>
        <div className="isi-chat-actions">{chatTools.menu}</div>
      </header>
      {chatTools.searchBar}

      <div ref={scrollRef} className="isi-messages">
        {messagesLoading && messages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : (
          <StandardChatMessageThread
            messages={messages}
            inboxMode="admin"
            emptyLabel={t('admin.chat.noMessages')}
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
          />
        )}
      </div>

      {chatTools.panels}

      <SupportMessageComposer
        value={composer.draft}
        onChange={composer.setDraft}
        onSend={composer.handleSend}
        placeholder={t('admin.modules.srf.chat.composerPlaceholder', {
          defaultValue: 'Écrire un message…',
        })}
        showVoice={false}
        extraActions={
          <ChatComposerModuleExtras
            chatModule="srf"
            conversationId={conversation.id}
            composer={composer}
            disabled={conversation.archived}
            showTagPicker={false}
          />
        }
        pendingEntities={composer.pendingEntities}
        onRemovePendingEntity={composer.removePendingEntity}
      />
    </section>
  );
};

export default AdminSrfChatThread;
