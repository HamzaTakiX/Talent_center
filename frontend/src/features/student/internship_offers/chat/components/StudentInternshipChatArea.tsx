import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChatEmptyState from '../../../../admin/shared/admin-module-chat/components/ChatEmptyState';
import SupportMessageComposer from '../../../../admin/shared/admin-support-inbox/components/SupportMessageComposer';
import type {
  InboxStats,
  InternshipConversation,
} from '../../../../admin/offres-stage/chat/types/internshipChatTypes';
import { InternshipChatMessagesSkeleton, InternshipChatWorkspaceSkeleton } from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import {
  StandardChatMessageThread,
  toChatToolMessages,
  useChatConversationTools,
} from '../../../../shared/chat-design-system';
import StudentInternshipChatHeader from './StudentInternshipChatHeader';

type Props = {
  conversation: InternshipConversation | null;
  stats: InboxStats;
  emptyStateStats?: {
    unread: number;
    waitingAdmin: number;
    waitingStudent: number;
    resolved: number;
  };
  messagesLoading?: boolean;
  conversationLoading?: boolean;
  statsLoading?: boolean;
  onSend: (text: string, files?: File[]) => void;
  onBack?: () => void;
  onViewOffer: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  peerTyping?: boolean;
  onTyping?: (isTyping: boolean) => void;
};

const StudentInternshipChatArea: FunctionComponent<Props> = ({
  conversation,
  stats,
  emptyStateStats,
  messagesLoading = false,
  conversationLoading = false,
  statsLoading = false,
  onSend,
  onBack,
  onViewOffer,
  onArchive,
  onUnarchive,
  peerTyping = false,
  onTyping,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(conversation?.messages ?? []),
    conversationKey: conversation?.id ?? '',
    counterpartyName: conversation?.company,
    archived: conversation?.archived,
    onArchive,
    onUnarchive,
    scrollContainerRef: scrollRef,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation?.messages.length, conversation?.id]);

  useEffect(() => {
    setDraft('');
    setPendingFiles([]);
    setAttachError(null);
  }, [conversation?.id]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text && !pendingFiles.length) return;
    onSend(text, pendingFiles.length ? pendingFiles : undefined);
    setDraft('');
    setPendingFiles([]);
    setAttachError(null);
  }, [draft, onSend, pendingFiles]);

  if ((conversationLoading || messagesLoading) && !conversation) {
    return <InternshipChatWorkspaceSkeleton />;
  }

  if (!conversation) {
    const displayStats = emptyStateStats ?? {
      unread: stats.unread,
      waitingAdmin: stats.waitingAdmin,
      waitingStudent: stats.waitingStudent,
      resolved: stats.resolved,
    };
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState
          title={t('student.internshipOffers.chat.emptyTitle')}
          description={t('student.internshipOffers.chat.emptyDescription')}
          moduleType="internship"
          statsLoading={statsLoading}
          stats={{
            unread: displayStats.unread,
            pending: displayStats.waitingStudent,
            resolved: displayStats.resolved,
          }}
        />
      </section>
    );
  }

  return (
    <section className="isi-chat">
      <StudentInternshipChatHeader
        conversation={conversation}
        onBack={onBack}
        onViewOffer={onViewOffer}
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
            systemEventsPrefix="student.internshipOffers.chat.systemEvents"
            emptyLabel={t('student.internshipOffers.chat.noMessages')}
            typing={peerTyping}
            typingLabel={t('student.internshipOffers.chat.adminTyping', {
              defaultValue: "L'administrateur écrit…",
            })}
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
            seenLabelFor={(msg) =>
              msg.seenTime
                ? t('student.internshipOffers.chat.seenAt', { time: msg.seenTime })
                : undefined
            }
          />
        )}
      </div>

      {chatTools.panels}

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onTyping={onTyping}
        pendingFiles={pendingFiles}
        onPendingFilesChange={setPendingFiles}
        attachError={attachError}
        onAttachError={setAttachError}
        placeholder={t('student.internshipOffers.chat.composer')}
        inputAriaLabel={t('student.internshipOffers.chat.composer')}
        attachAriaLabel={t('student.internshipOffers.chat.attachFile')}
        sendAriaLabel={t('student.internshipOffers.chat.sendMessage')}
        showVoice={false}
      />
    </section>
  );
};

export default StudentInternshipChatArea;
