import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { resolveChatMessageBubbleText } from '../../contextual-chat/utils/chatAttachmentUtils';
import ChatConversationHistoryPanel from '../components/ChatConversationHistoryPanel';
import ChatConversationMenu from '../components/ChatConversationMenu';
import ChatConversationSearchBar from '../components/ChatConversationSearchBar';
import ChatSearchTextHighlight from '../components/ChatSearchTextHighlight';
import ChatSharedAttachmentsPanel from '../components/ChatSharedAttachmentsPanel';
import type { ChatToolMessage } from '../types/chatConversationToolsTypes';
import {
  buildConversationHistory,
  collectSharedAttachments,
  findSearchMatches,
  getMatchedIndicesForMessage,
} from '../utils/chatConversationToolsUtils';

export type UseChatConversationToolsOptions = {
  messages: ChatToolMessage[];
  conversationKey: string;
  counterpartyName?: string;
  archived?: boolean;
  showArchive?: boolean;
  onArchive?: () => void;
  onUnarchive?: () => void;
  scrollContainerRef?: RefObject<HTMLElement | null>;
};

export function useChatConversationTools({
  messages,
  conversationKey,
  counterpartyName,
  archived = false,
  showArchive = true,
  onArchive,
  onUnarchive,
  scrollContainerRef,
}: UseChatConversationToolsOptions) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setAttachmentsOpen(false);
    setHistoryOpen(false);
    setSearchQuery('');
    setActiveMatchIndex(0);
  }, [conversationKey]);

  const searchMatches = useMemo(
    () => findSearchMatches(messages, searchQuery),
    [messages, searchQuery],
  );

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [searchQuery, conversationKey]);

  const sharedAttachments = useMemo(
    () =>
      collectSharedAttachments(messages, {
        self: t('admin.chat.you'),
        other: counterpartyName ?? t('admin.chat.otherParticipant'),
      }),
    [counterpartyName, messages, t],
  );

  const historyEntries = useMemo(
    () =>
      buildConversationHistory(messages, {
        firstMessage: t('admin.chat.firstMessage'),
        event: t('admin.chat.historyEvent'),
      }),
    [messages, t],
  );

  const scrollToMessage = useCallback(
    (messageId: string) => {
      const root = scrollContainerRef?.current ?? document;
      const element = root.querySelector(`[data-chat-msg-id="${messageId}"]`);
      if (element instanceof HTMLElement) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('chat-msg--search-target');
        window.setTimeout(() => element.classList.remove('chat-msg--search-target'), 1600);
      }
    },
    [scrollContainerRef],
  );

  useEffect(() => {
    if (!searchOpen || !searchQuery.trim() || !searchMatches.length) return;
    const match = searchMatches[activeMatchIndex];
    if (match) scrollToMessage(match.messageId);
  }, [activeMatchIndex, searchMatches, searchOpen, searchQuery, scrollToMessage]);

  const goToNextMatch = useCallback(() => {
    if (!searchMatches.length) return;
    setActiveMatchIndex((prev) => (prev + 1) % searchMatches.length);
  }, [searchMatches.length]);

  const goToPrevMatch = useCallback(() => {
    if (!searchMatches.length) return;
    setActiveMatchIndex((prev) => (prev - 1 + searchMatches.length) % searchMatches.length);
  }, [searchMatches.length]);

  const getMessageBlockProps = useCallback(
    (messageId: string) => {
      const isActive =
        searchOpen &&
        searchQuery.trim() &&
        searchMatches[activeMatchIndex]?.messageId === messageId;

      return {
        'data-chat-msg-id': messageId,
        className: isActive ? 'isi-msg-block chat-msg--active-match' : 'isi-msg-block',
      };
    },
    [activeMatchIndex, searchMatches, searchOpen, searchQuery],
  );

  const renderHighlightedText = useCallback(
    (messageId: string, text: string): ReactNode => {
      if (!searchOpen || !searchQuery.trim()) return text;
      const indices = getMatchedIndicesForMessage(searchMatches, messageId, activeMatchIndex);
      if (!indices.length) return text;
      return <ChatSearchTextHighlight text={text} matchedIndices={indices} />;
    },
    [activeMatchIndex, searchMatches, searchOpen, searchQuery],
  );

  const renderBubbleText = useCallback(
    (message: ChatToolMessage): ReactNode => {
      const text = resolveChatMessageBubbleText(
        message.text,
        message.attachments,
        message.attachmentName,
        message.messageType,
      );
      if (!text) return null;
      return renderHighlightedText(message.id, text);
    },
    [renderHighlightedText],
  );

  const menu = (
    <ChatConversationMenu
      open={menuOpen}
      onOpenChange={setMenuOpen}
      archived={archived}
      showArchive={showArchive}
      searchActive={searchOpen}
      onOpenAttachments={() => setAttachmentsOpen(true)}
      onOpenSearch={() => setSearchOpen(true)}
      onOpenHistory={() => setHistoryOpen(true)}
      onArchive={onArchive}
      onUnarchive={onUnarchive}
    />
  );

  const searchBar = (
    <ChatConversationSearchBar
      open={searchOpen}
      query={searchQuery}
      onQueryChange={setSearchQuery}
      matchCount={searchMatches.length}
      activeMatchIndex={activeMatchIndex}
      onPrevMatch={goToPrevMatch}
      onNextMatch={goToNextMatch}
      onClose={() => {
        setSearchOpen(false);
        setSearchQuery('');
      }}
    />
  );

  const panels = (
    <>
      <ChatSharedAttachmentsPanel
        open={attachmentsOpen}
        items={sharedAttachments}
        onClose={() => setAttachmentsOpen(false)}
      />
      <ChatConversationHistoryPanel
        open={historyOpen}
        entries={historyEntries}
        onClose={() => setHistoryOpen(false)}
        onJumpToMessage={scrollToMessage}
      />
    </>
  );

  return {
    menu,
    searchBar,
    panels,
    getMessageBlockProps,
    renderHighlightedText,
    renderBubbleText,
    scrollToMessage,
    searchOpen,
    searchQuery,
  };
}
