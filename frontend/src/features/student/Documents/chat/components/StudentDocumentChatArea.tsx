import { FunctionComponent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ChatEmptyState from '../../../../admin/shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../../admin/shared/admin-support-inbox/components/SupportMessageComposer';
import {
  InternshipChatMessagesSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import {
  StandardChatMessageThread,
  toChatToolMessages,
  useChatConversationTools,
} from '../../../../shared/chat-design-system';
import ChatComposerModuleExtras from '../../../../shared/contextual-chat/components/ChatComposerModuleExtras';
import type { ChatEntityReference } from '../../../../shared/contextual-chat/types/chatEntityTypes';
import { useSupportChatAreaComposer } from '../../../../shared/contextual-chat/hooks/useSupportChatAreaComposer';
import type { StudentDocumentConversation } from '../utils/studentDocumentChatMappers';
import StudentDocumentChatHeader from './StudentDocumentChatHeader';

type Props = {
  conversation: StudentDocumentConversation | null;
  unreadTotal: number;
  messagesLoading?: boolean;
  conversationLoading?: boolean;
  statsLoading?: boolean;
  peerTyping?: boolean;
  onSend: (
    text: string,
    files?: File[],
    tagCodes?: string[],
    entityRefs?: ChatEntityReference[],
  ) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
};

const StudentDocumentChatArea: FunctionComponent<Props> = ({
  conversation,
  unreadTotal,
  messagesLoading = false,
  conversationLoading = false,
  statsLoading = false,
  peerTyping = false,
  onSend,
  onTyping,
  onBack,
  onArchive,
  onUnarchive,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const composer = useSupportChatAreaComposer(conversation?.id, onSend);

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(conversation?.messages ?? []),
    conversationKey: conversation?.id ?? '',
    counterpartyName: t('admin.chat.otherParticipant'),
    archived: conversation?.archived,
    showArchive: false,
    onArchive,
    onUnarchive,
    scrollContainerRef: scrollRef,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.id, peerTyping]);

  if ((conversationLoading || messagesLoading) && !conversation) {
    return <InternshipChatWorkspaceSkeleton />;
  }

  if (!conversation) {
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState
          title={t('student.documents.chat.emptyTitle', {
            defaultValue: 'Aucune conversation sélectionnée',
          })}
          description={t('student.documents.chat.emptyDescription', {
            defaultValue: 'Posez une question depuis un document ou choisissez un fil existant.',
          })}
          moduleType="documents"
          statsLoading={statsLoading}
          stats={{ unread: unreadTotal, pending: 0, resolved: 0 }}
        />
      </section>
    );
  }

  return (
    <section className="isi-chat">
      <StudentDocumentChatHeader
        conversation={conversation}
        onBack={onBack}
        conversationMenu={chatTools.menu}
      />
      {chatTools.searchBar}

      <div ref={scrollRef} className="isi-messages">
        {messagesLoading && conversation.messages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : (
          <StandardChatMessageThread
            messages={conversation.messages}
            inboxMode="student"
            emptyLabel={t('student.documents.chat.noMessages', {
              defaultValue: 'Aucun message pour le moment',
            })}
            typing={peerTyping}
            typingLabel={t('student.documents.chat.adminTyping', {
              defaultValue: "L'administrateur écrit…",
            })}
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
            seenLabelFor={(msg) =>
              msg.seenTime
                ? t('student.documents.chat.seenAt', {
                    defaultValue: 'Vu à {{time}}',
                    time: msg.seenTime,
                  })
                : undefined
            }
          />
        )}
      </div>

      {chatTools.panels}

      <SupportMessageComposer
        value={composer.draft}
        onChange={composer.setDraft}
        onSend={composer.handleSend}
        onTyping={onTyping}
        pendingFiles={composer.pendingFiles}
        onPendingFilesChange={composer.setPendingFiles}
        attachError={composer.attachError}
        onAttachError={composer.setAttachError}
        placeholder={t('student.documents.chat.composer')}
        inputAriaLabel={t('student.documents.chat.composer')}
        sendAriaLabel={t('student.documents.chat.sendMessage', {
          defaultValue: 'Envoyer le message',
        })}
        attachAriaLabel={t('student.documents.chat.attachFile', { defaultValue: 'Joindre un fichier' })}
        showVoice={false}
        extraActions={
          <ChatComposerModuleExtras
            chatModule="documents"
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

export default StudentDocumentChatArea;
