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
import type { StudentAnnouncementConversation } from '../utils/studentAnnouncementChatMappers';
import StudentAnnouncementChatHeader from './StudentAnnouncementChatHeader';

type Props = {
  conversation: StudentAnnouncementConversation | null;
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
  onViewAnnouncement: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
};

const StudentAnnouncementChatArea: FunctionComponent<Props> = ({
  conversation,
  unreadTotal,
  messagesLoading = false,
  conversationLoading = false,
  statsLoading = false,
  peerTyping = false,
  onSend,
  onTyping,
  onBack,
  onViewAnnouncement,
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
          title={t('student.announcements.chat.emptyTitle')}
          description={t('student.announcements.chat.emptyDescription')}
          moduleType="announcements"
          statsLoading={statsLoading}
          stats={{ unread: unreadTotal, pending: 0, resolved: 0 }}
        />
      </section>
    );
  }

  return (
    <section className="isi-chat">
      <StudentAnnouncementChatHeader
        conversation={conversation}
        onBack={onBack}
        onViewAnnouncement={onViewAnnouncement}
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
            emptyLabel={t('student.announcements.chat.noMessages', {
              defaultValue: 'Aucun message pour le moment',
            })}
            typing={peerTyping}
            typingLabel={t('student.announcements.chat.adminTyping', {
              defaultValue: "L'administrateur écrit…",
            })}
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
            seenLabelFor={(msg) =>
              msg.seenTime
                ? t('student.announcements.chat.seenAt', {
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
        placeholder={t('student.announcements.chat.composer')}
        inputAriaLabel={t('student.announcements.chat.composer')}
        sendAriaLabel={t('student.announcements.chat.sendMessage', {
          defaultValue: t('student.announcements.chat.send'),
        })}
        attachAriaLabel={t('student.announcements.chat.attachFile', { defaultValue: 'Joindre un fichier' })}
        showVoice={false}
        extraActions={
          <ChatComposerModuleExtras
            chatModule="announcements"
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

export default StudentAnnouncementChatArea;
