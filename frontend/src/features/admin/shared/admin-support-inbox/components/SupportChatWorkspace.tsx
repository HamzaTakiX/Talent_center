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
import type { SupportChatThread, SupportInboxStats } from '../types/supportInboxTypes';
import SupportChatHeader, { type SupportChatHeaderMenuItem } from './SupportChatHeader';
import SupportMessageComposer from './SupportMessageComposer';
import SupportMessageThread from './SupportMessageThread';

interface Props {
  thread: SupportChatThread | null;
  emptyState: Omit<ChatEmptyStateProps, 'className'>;
  stats?: SupportInboxStats | ChatEmptyStateStats;
  onSend: (text: string) => void;
  onBack?: () => void;
  headerMeta?: string;
  headerActions?: ReactNode;
  headerMenuItems?: SupportChatHeaderMenuItem[];
  composerPlaceholder?: string;
  simulateTyping?: boolean;
}

const SupportChatWorkspace: FunctionComponent<Props> = ({
  thread,
  emptyState,
  stats,
  onSend,
  onBack,
  headerMeta,
  headerActions,
  headerMenuItems,
  composerPlaceholder,
  simulateTyping = true,
}) => {
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  if (!thread) {
    return (
      <section className="isi-chat isi-chat--empty">
        <ChatEmptyState {...emptyState} stats={stats} />
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
        menuItems={headerMenuItems}
      />

      <div ref={scrollRef} className="isi-messages">
        <SupportMessageThread messages={thread.messages} typing={typing} />
      </div>

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
