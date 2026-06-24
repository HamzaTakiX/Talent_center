import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BellOff,
  CheckCheck,
  DollarSign,
  MoreVertical,
  Search,
  X,
} from 'lucide-react';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import SupportMessageComposer from '../../../shared/admin-support-inbox/components/SupportMessageComposer';
import ChatEmptyState from '../../../shared/admin-module-chat/components/ChatEmptyState';
import { useChatEmptyState } from '../../../i18n/useAdminCopy';
import type { ChatEmptyStateStats } from '../../../shared/admin-module-chat/types/chatEmptyStateTypes';
import type { AdminSrfChatMessage, AdminSrfConversation } from '../types/adminSrfChatTypes';

type Props = {
  conversation: AdminSrfConversation | null;
  inboxStats?: ChatEmptyStateStats;
  onSend: (text: string) => void;
  onMarkRead: () => void;
};

function formatNowTime(language: string): string {
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOutside();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, onOutside, active]);
}

const ChatDropdown: FunctionComponent<{
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
}> = ({ open, onClose, trigger, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, open);

  return (
    <div ref={ref} className="relative">
      {trigger}
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="admin-chat-dropdown absolute end-0 top-[calc(100%+6px)] z-50 min-w-[11.5rem] overflow-hidden rounded-xl border border-[var(--admin-border)] py-1 shadow-admin-lg"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const ChatMenuButton: FunctionComponent<{
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}> = ({ icon, label, onClick, active }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`admin-chat-menu-item flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm ${
      active ? 'admin-chat-menu-item--active' : ''
    }`}
  >
    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--admin-text-secondary)]">
      {icon}
    </span>
    <span className="min-w-0 flex-1 truncate font-medium text-[var(--admin-text)]">{label}</span>
  </button>
);

const AdminSrfChatThread: FunctionComponent<Props> = ({
  conversation,
  inboxStats,
  onSend,
  onMarkRead,
}) => {
  const { t, i18n } = useTranslation();
  const toast = useAdminToast();
  const emptyState = useChatEmptyState('srf');
  const [draft, setDraft] = useState('');
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  const [threadSearchOpen, setThreadSearchOpen] = useState(false);
  const [threadSearch, setThreadSearch] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const threadSearchRef = useRef<HTMLInputElement>(null);

  const messages = conversation?.messages ?? [];

  const filteredMessages = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (message: AdminSrfChatMessage) =>
        message.text.toLowerCase().includes(q) ||
        (message.topicTag?.toLowerCase().includes(q) ?? false)
    );
  }, [messages, threadSearch]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [filteredMessages.length, messages.length, conversation?.id]);

  useEffect(() => {
    setDraft('');
    setThreadSearch('');
    setThreadSearchOpen(false);
  }, [conversation?.id]);

  useEffect(() => {
    if (!threadSearchOpen) return undefined;
    const timer = window.setTimeout(() => threadSearchRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [threadSearchOpen]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text || !conversation) return;
    onSend(text);
    setDraft('');
  }, [conversation, draft, onSend]);

  const openThreadSearch = () => {
    setThreadSearchOpen(true);
    setThreadMenuOpen(false);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      toast.showToast(t(next ? 'admin.chat.muted' : 'admin.chat.unmuted'), 'info');
      return next;
    });
    setThreadMenuOpen(false);
  };

  if (!conversation) {
    return (
      <section className="student-srf-chat-thread flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--admin-bg-subtle)]">
        <div className="admin-chat-empty flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <ChatEmptyState {...emptyState} stats={inboxStats} />
        </div>
      </section>
    );
  }

  return (
    <section className="student-srf-chat-thread flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--admin-bg-subtle)]">
      <header className="shrink-0 border-b border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand)] text-sm font-bold text-white shadow-sm">
              {conversation.studentInitials}
            </span>
            <div className="min-w-0">
              <h2 className="m-0 truncate text-sm font-bold text-[var(--admin-text)] sm:text-[15px]">
                {conversation.studentName}
              </h2>
              <p className="m-0 mt-0.5 truncate text-xs font-medium text-[var(--admin-text-secondary)]">
                {conversation.statusLabel}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setThreadSearchOpen((v) => !v);
                setThreadMenuOpen(false);
              }}
              aria-label={t('admin.chat.openSearch')}
              aria-pressed={threadSearchOpen}
              className={`inline-flex size-9 items-center justify-center rounded-lg transition-colors ${
                threadSearchOpen
                  ? 'bg-[var(--admin-row-hover)] text-[var(--admin-text)]'
                  : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)]'
              }`}
            >
              <Search className="size-4" strokeWidth={2} aria-hidden />
            </button>

            <ChatDropdown
              open={threadMenuOpen}
              onClose={() => setThreadMenuOpen(false)}
              trigger={
                <button
                  type="button"
                  aria-label={t('admin.chat.moreActions')}
                  aria-expanded={threadMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setThreadMenuOpen((v) => !v)}
                  className={`inline-flex size-9 items-center justify-center rounded-lg transition-colors ${
                    threadMenuOpen
                      ? 'bg-[var(--admin-row-hover)] text-[var(--admin-text)]'
                      : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)]'
                  }`}
                >
                  <MoreVertical className="size-4" strokeWidth={2} aria-hidden />
                </button>
              }
            >
              <ChatMenuButton
                icon={<Search className="h-3.5 w-3.5" strokeWidth={2} />}
                label={t('admin.chat.searchInConversation')}
                onClick={openThreadSearch}
                active={threadSearchOpen}
              />
              <ChatMenuButton
                icon={<CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />}
                label={t('admin.chat.markRead')}
                onClick={() => {
                  onMarkRead();
                  toast.showToast(t('admin.chat.markedRead'), 'success');
                  setThreadMenuOpen(false);
                }}
              />
              <ChatMenuButton
                icon={<BellOff className="h-3.5 w-3.5" strokeWidth={2} />}
                label={isMuted ? t('admin.chat.unmute') : t('admin.chat.mute')}
                onClick={toggleMute}
                active={isMuted}
              />
            </ChatDropdown>
          </div>
        </div>

        <AnimatePresence>
          {threadSearchOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[var(--admin-border)]"
            >
              <div className="relative px-3 py-2 sm:px-4">
                <Search
                  className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)] sm:left-7"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  ref={threadSearchRef}
                  type="text"
                  value={threadSearch}
                  onChange={(e) => setThreadSearch(e.target.value)}
                  placeholder={t('admin.chat.searchInConversation')}
                  aria-label={t('admin.chat.searchInConversation')}
                  className="admin-chat-search-input h-9 w-full rounded-full border border-solid py-0 pl-9 pr-8 text-sm"
                  autoComplete="off"
                  spellCheck={false}
                />
                {threadSearch.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      setThreadSearch('');
                      threadSearchRef.current?.focus();
                    }}
                    aria-label={t('admin.chat.clearSearch')}
                    className="absolute right-5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--admin-text-muted)] hover:bg-[var(--admin-row-hover)] sm:right-6"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                  </button>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <div
        ref={scrollRef}
        className="admin-chat-messages admin-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
      >
        {filteredMessages.length === 0 ? (
          <div className="admin-chat-empty flex flex-1 flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-medium text-[var(--admin-text)]">{t('admin.chat.noMessages')}</p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const isOut = message.direction === 'out';
            return (
              <div key={message.id}>
                {message.separatorBefore ? (
                  <div className="mb-3 flex justify-center">
                    <span className="admin-chat-date-separator">{message.separatorBefore}</span>
                  </div>
                ) : null}
                <div
                  className={`admin-chat-msg-row student-srf-chat-msg-row flex w-full items-start gap-2.5 ${
                    isOut ? 'admin-chat-msg-row--out' : 'admin-chat-msg-row--in'
                  }`}
                >
                  {!isOut ? (
                    <span
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand)] text-xs font-bold text-white"
                      aria-hidden
                    >
                      {conversation.studentInitials}
                    </span>
                  ) : null}
                  <div className={`flex max-w-[min(100%,34rem)] flex-col ${isOut ? 'items-end' : 'items-start'}`}>
                    {message.topicTag ? (
                      <span className="student-srf-chat-topic-tag mb-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-[var(--admin-text-secondary)]">
                        <DollarSign className="size-3" strokeWidth={2} aria-hidden />
                        {message.topicTag}
                      </span>
                    ) : null}
                    <div
                      className={`admin-chat-bubble--${message.direction} rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        isOut ? 'rounded-br-md' : 'rounded-bl-md'
                      }`}
                    >
                      {message.text}
                    </div>
                    <time
                      className={`admin-chat-msg-time mt-1 block text-[11px] ${
                        isOut ? 'admin-chat-msg-time--out text-end' : ''
                      }`}
                      dateTime={message.time}
                    >
                      {message.time}
                    </time>
                  </div>
                  {isOut ? (
                    <span
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white"
                      aria-hidden
                    >
                      SRF
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        placeholder={t('student.srf.chat.composer')}
        inputAriaLabel={t('student.srf.chat.composer')}
        attachAriaLabel={t('student.srf.chat.attach')}
        sendAriaLabel={t('student.srf.chat.send')}
        showVoice={false}
      />
    </section>
  );
};

export default AdminSrfChatThread;
