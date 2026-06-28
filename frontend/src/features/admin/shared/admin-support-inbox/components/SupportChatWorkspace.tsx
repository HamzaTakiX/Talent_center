import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import ChatEmptyState from '../../admin-module-chat/components/ChatEmptyState';
import type { ChatEmptyStateProps, ChatEmptyStateStats } from '../../admin-module-chat/types/chatEmptyStateTypes';
import {
  InternshipChatMessagesSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../offres-stage/chat/components/InternshipChatLoadingSkeletons';
import {
  toChatToolMessages,
  useChatConversationTools,
} from '../../../../shared/chat-design-system';
import type { SupportChatThread, SupportInboxStats } from '../types/supportInboxTypes';
import SupportChatHeader from './SupportChatHeader';
import SupportMessageComposer from './SupportMessageComposer';
import SupportMessageThread from './SupportMessageThread';

interface Props {
  thread: SupportChatThread | null;
  emptyState: Omit<ChatEmptyStateProps, 'className'>;
  stats?: SupportInboxStats | ChatEmptyStateStats;
  statsLoading?: boolean;
  conversationLoading?: boolean;
  messagesLoading?: boolean;
  onSend: (text: string) => void;
  onBack?: () => void;
  headerMeta?: string;
  headerActions?: ReactNode;
  composerPlaceholder?: string;
  simulateTyping?: boolean;
  archived?: boolean;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

const SupportChatWorkspace: FunctionComponent<Props> = ({
  thread,
  emptyState,
  stats,
  statsLoading = false,
  conversationLoading = false,
  messagesLoading = false,
  onSend,
  onBack,
  headerMeta,
  headerActions,
  composerPlaceholder,
  simulateTyping = true,
  archived = false,
  onArchive,
  onUnarchive,
}) => {
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(thread?.messages ?? []),
    conversationKey: thread?.id ?? '',
    counterpartyName: thread?.title,
    archived,
    onArchive,
    onUnarchive,
    scrollContainerRef: scrollRef,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread?.messages.length, thread?.id]);

  useEffect(() => {
    setDraft('');
  }, [thread?.id]);

  useEffect(() => {
    if (!thread || !simulateTyping) return;
    setTyping(Math.random() > 0.7);
    const t = window.setTimeout(() => setTyping(false), 2500);
    return () => window.clearTimeout(t);
  }, [thread?.id, simulateTyping]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }, [draft, onSend]);

  if ((conversationLoading || messagesLoading) && !thread) {
    return <InternshipChatWorkspaceSkeleton />;
  }

  if (!thread) {
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState {...emptyState} stats={stats} statsLoading={statsLoading} />
      </section>
    );
  }

  return (
    <section className="isi-chat">
      <SupportChatHeader
        avatarInitials={thread.avatarInitials}
        title={thread.title}
        meta={headerMeta ?? thread.meta}
        onBack={onBack}
        actions={headerActions}
        conversationMenu={chatTools.menu}
      />
      {chatTools.searchBar}

      <div ref={scrollRef} className="isi-messages">
        {messagesLoading && thread.messages.length === 0 ? (
          <InternshipChatMessagesSkeleton embedded />
        ) : (
          <SupportMessageThread
            messages={thread.messages}
            typing={typing}
            getMessageBlockProps={chatTools.getMessageBlockProps}
            renderHighlightedText={chatTools.renderHighlightedText}
          />
        )}
      </div>

      {chatTools.panels}

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        placeholder={composerPlaceholder}
      />
    </section>
  );
};

export default SupportChatWorkspace;
