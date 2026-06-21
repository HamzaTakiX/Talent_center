import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BellOff,
  CheckCheck,
  CheckCircle2,
  Filter,
  Menu,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Tag,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../dashboard/components/AdminLayout';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import type { AdminChatMessage, AdminChatParticipant } from './adminChatTypes';
import ChatEmptyState from './components/ChatEmptyState';
import type { ChatEmptyStateProps, ChatEmptyStateStats } from './types/chatEmptyStateTypes';

const DEFAULT_RINGS = [
  'bg-[#5ba3ff] text-white',
  'bg-[#a78bfa] text-white',
  'bg-[#f59e0b] text-white',
  'bg-[#22d3ee] text-[#082f49]',
];

type ListFilter = 'all' | 'unread';
type MobileView = 'list' | 'thread';

function ringFor(id: string, extra?: Record<string, string>): string {
  if (extra?.[id]) return extra[id];
  const idx = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % DEFAULT_RINGS.length;
  return DEFAULT_RINGS[idx];
}

function formatNowTime(language: string): string {
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
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
  align?: 'left' | 'right';
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}> = ({ open, onClose, align = 'right', trigger, children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, open);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {trigger}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`admin-chat-dropdown absolute top-[calc(100%+6px)] z-50 min-w-[11.5rem] overflow-hidden rounded-xl border border-[var(--admin-border)] py-1 shadow-admin-lg ${
              align === 'left' ? 'left-0' : 'right-0'
            }`}
          >
            {children}
          </motion.div>
        )}
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

export type AdminModuleChatLayoutProps = {
  children: ReactNode;
  mainFillHeight?: boolean;
  contentFlush?: boolean;
};

export interface AdminModuleChatProps {
  participantsSeed: AdminChatParticipant[];
  initialMessages: Record<string, AdminChatMessage[]>;
  participantSubtitle?: string;
  avatarClassByParticipantId?: Record<string, string>;
  searchPlaceholder?: string;
  composerPlaceholder?: string;
  /** @deprecated Prefer chatEmptyState for the unified empty illustration */
  emptyConversationLabel?: string;
  chatEmptyState?: Omit<ChatEmptyStateProps, 'className' | 'stats'> & { stats?: ChatEmptyStateStats };
  /** Shell layout (default: AdminLayout). Student portal passes StudentLayout. */
  Layout?: ComponentType<AdminModuleChatLayoutProps>;
  /** Status strip above chat (live / demo / loading) */
  topBanner?: ReactNode;
  /** Contextual workflow header below thread toolbar */
  contextHeader?: ReactNode;
  /** Right-side contextual panel (workflow summary) */
  rightPanel?: ReactNode;
  /** Workflow actions above composer */
  smartActionsBar?: ReactNode;
  selectedConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onSendMessage?: (text: string, conversationId: string) => boolean | Promise<boolean>;
  renderConversationBadge?: (participant: AdminChatParticipant) => ReactNode;
  renderListMeta?: (participant: AdminChatParticipant) => ReactNode;
  /** Max characters allowed in composer (default: no limit) */
  composerMaxLength?: number;
}

const AdminModuleChat: FunctionComponent<AdminModuleChatProps> = ({
  participantsSeed,
  initialMessages,
  participantSubtitle,
  avatarClassByParticipantId,
  searchPlaceholder,
  composerPlaceholder,
  emptyConversationLabel,
  chatEmptyState,
  Layout = AdminLayout,
  topBanner,
  contextHeader,
  rightPanel,
  smartActionsBar,
  selectedConversationId,
  onSelectConversation,
  onSendMessage,
  renderConversationBadge,
  renderListMeta,
  composerMaxLength,
}) => {
  const { t, i18n } = useTranslation();
  const toast = useAdminToast();
  const isMobile = useIsMobile();

  const [conversationRows, setConversationRows] = useState<AdminChatParticipant[]>(() =>
    participantsSeed.map((c) => ({ ...c }))
  );
  const [selectedId, setSelectedId] = useState(
    selectedConversationId ?? participantsSeed[0]?.id ?? ''
  );
  const [search, setSearch] = useState('');
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [draft, setDraft] = useState('');
  const [messagesByConv, setMessagesByConv] = useState<Record<string, AdminChatMessage[]>>(() => ({
    ...initialMessages,
  }));
  const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>(() =>
    Object.fromEntries(participantsSeed.map((c) => [c.id, c.unreadCount]))
  );
  const [mutedIds, setMutedIds] = useState<Set<string>>(() => new Set());
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  const [threadSearchOpen, setThreadSearchOpen] = useState(false);
  const [threadSearch, setThreadSearch] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const sidebarSearchRef = useRef<HTMLInputElement>(null);
  const threadSearchRef = useRef<HTMLInputElement>(null);

  const adjustComposerHeight = useCallback(() => {
    const el = composerRef.current;
    if (!el) return;
    const lineHeight = 32;
    el.style.height = 'auto';
    el.style.height = `${Math.max(lineHeight, Math.min(el.scrollHeight, 96))}px`;
  }, []);

  const selectedConv = conversationRows.find((c) => c.id === selectedId);
  const isMuted = selectedId ? mutedIds.has(selectedId) : false;

  const filteredConversations = useMemo(() => {
    let rows = conversationRows;
    if (listFilter === 'unread') {
      rows = rows.filter((c) => (unreadByConv[c.id] ?? 0) > 0);
    }
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => {
      if (c.title.toLowerCase().includes(q) || c.lastPreview.toLowerCase().includes(q)) return true;
      return (messagesByConv[c.id] ?? []).some((m) => m.text.toLowerCase().includes(q));
    });
  }, [conversationRows, listFilter, unreadByConv, search, messagesByConv]);

  const thread = messagesByConv[selectedId] ?? [];

  const filteredThread = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return thread;
    return thread.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        (m.separatorBefore?.toLowerCase().includes(q) ?? false)
    );
  }, [thread, threadSearch]);

  const computedEmptyStats = useMemo((): ChatEmptyStateStats | undefined => {
    if (chatEmptyState?.stats) return chatEmptyState.stats;
    const unread = Object.values(unreadByConv).reduce((sum, count) => sum + count, 0);
    if (unread === 0) return undefined;
    return { unread };
  }, [chatEmptyState?.stats, unreadByConv]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [filteredThread.length, selectedId, threadSearch]);

  useEffect(() => {
    setUnreadByConv((prev) => ({ ...prev, [selectedId]: 0 }));
  }, [selectedId]);

  useEffect(() => {
    if (selectedConversationId) setSelectedId(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    setConversationRows(participantsSeed.map((c) => ({ ...c })));
    setMessagesByConv((prev) => {
      const base = { ...initialMessages };
      for (const [convId, msgs] of Object.entries(prev)) {
        const local = msgs.filter((m) => m.id.startsWith('local-'));
        if (local.length) {
          base[convId] = [...(base[convId] ?? []), ...local];
        }
      }
      return base;
    });
  }, [participantsSeed, initialMessages]);

  useEffect(() => {
    if (threadSearchOpen) {
      const t = window.setTimeout(() => threadSearchRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [threadSearchOpen]);

  useEffect(() => {
    adjustComposerHeight();
  }, [draft, adjustComposerHeight, selectedId, mobileView]);

  const markConversationRead = useCallback((id: string) => {
    setUnreadByConv((prev) => ({ ...prev, [id]: 0 }));
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadByConv((prev) => Object.fromEntries(Object.keys(prev).map((id) => [id, 0])));
    toast.showToast(t('admin.chat.allMarkedRead'), 'success');
  }, [t, toast]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedId) return;
    if (onSendMessage) {
      const ok = await onSendMessage(text, selectedId);
      if (!ok) return;
    } else {
      const msg: AdminChatMessage = {
        id: `local-${Date.now()}`,
        direction: 'out',
        text,
        time: formatNowTime(i18n.language),
      };
      setMessagesByConv((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), msg],
      }));
    }
    setDraft('');
    if (composerRef.current) {
      composerRef.current.style.height = '2rem';
    }
    const nowLbl = formatNowTime(i18n.language);
    setConversationRows((rows) =>
      rows.map((r) => (r.id === selectedId ? { ...r, lastPreview: text, timeLabel: nowLbl } : r))
    );
  };

  const selectConversation = (c: AdminChatParticipant) => {
    setSelectedId(c.id);
    onSelectConversation?.(c.id);
    markConversationRead(c.id);
    setThreadSearch('');
    setThreadSearchOpen(false);
    setThreadMenuOpen(false);
    if (isMobile) setMobileView('thread');
  };

  const toggleMute = () => {
    if (!selectedId) return;
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(selectedId)) {
        next.delete(selectedId);
        toast.showToast(t('admin.chat.unmuted'), 'info');
      } else {
        next.add(selectedId);
        toast.showToast(t('admin.chat.muted'), 'info');
      }
      return next;
    });
    setThreadMenuOpen(false);
  };

  const layoutClass =
    isMobile && mobileView === 'thread'
      ? 'admin-chat-layout--mobile-thread'
      : isMobile
        ? 'admin-chat-layout--mobile-list'
        : '';

  return (
    <Layout mainFillHeight contentFlush>
      <div className="admin-chat-shell font-inter flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
        {topBanner}
        <div
          className={`admin-chat-layout ctx-chat-layout flex min-h-0 flex-1 overflow-hidden ${layoutClass} ${rightPanel ? 'ctx-chat-layout--with-panel' : ''}`}
        >
          <aside className="admin-chat-sidebar flex h-full min-h-0 w-full max-w-[100%] shrink-0 flex-col border-r border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] sm:w-[clamp(260px,32vw,340px)]">
            <div className="admin-chat-sidebar-toolbar flex min-h-[2.875rem] shrink-0 items-center gap-2 border-b border-solid border-[var(--admin-border)] px-2.5">
              <ChatDropdown
                open={sidebarMenuOpen}
                onClose={() => setSidebarMenuOpen(false)}
                align="left"
                trigger={
                  <button
                    type="button"
                    aria-label={t('admin.chat.sidebarMenu')}
                    aria-expanded={sidebarMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setSidebarMenuOpen((v) => !v)}
                    className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)] ${
                      sidebarMenuOpen ? 'bg-[var(--admin-row-hover)] text-[var(--admin-text)]' : ''
                    }`}
                  >
                    <Menu className="size-5" strokeWidth={1.75} aria-hidden />
                  </button>
                }
              >
                <ChatMenuButton
                  icon={<Filter className="h-3.5 w-3.5" strokeWidth={2} />}
                  label={t('admin.chat.filterAll')}
                  active={listFilter === 'all'}
                  onClick={() => {
                    setListFilter('all');
                    setSidebarMenuOpen(false);
                  }}
                />
                <ChatMenuButton
                  icon={<CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />}
                  label={t('admin.chat.filterUnread')}
                  active={listFilter === 'unread'}
                  onClick={() => {
                    setListFilter('unread');
                    setSidebarMenuOpen(false);
                  }}
                />
                <div className="my-1 border-t border-[var(--admin-border)]" role="separator" />
                <ChatMenuButton
                  icon={<CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />}
                  label={t('admin.chat.markAllRead')}
                  onClick={() => {
                    markAllRead();
                    setSidebarMenuOpen(false);
                  }}
                />
              </ChatDropdown>

              <div className="relative flex min-h-[2.25rem] min-w-0 flex-1 items-center">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  ref={sidebarSearchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="admin-chat-search-input box-border inline-flex h-9 min-h-[2.25rem] w-full items-center rounded-full border border-solid border-transparent py-0 pl-9 pr-8 text-sm leading-normal align-middle transition-colors"
                />
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      sidebarSearchRef.current?.focus();
                    }}
                    aria-label={t('admin.chat.clearSearch')}
                    className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)]"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>

            <nav className="admin-chat-conv-list min-h-0 flex-1 overflow-y-auto" aria-label={searchPlaceholder}>
              {filteredConversations.length === 0 ? (
                <div className="admin-chat-conv-empty px-4 py-8 text-center">
                  <p className="text-sm font-medium text-[var(--admin-text)]">{t('admin.chat.noConversations')}</p>
                  <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{t('admin.chat.noConversationsHint')}</p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const unread = unreadByConv[c.id] ?? 0;
                  const active = c.id === selectedId;
                  const ring = ringFor(c.id, avatarClassByParticipantId);
                  const muted = mutedIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectConversation(c)}
                      className={`admin-chat-conv-item ${active ? 'admin-chat-conv-item--active' : ''}`}
                    >
                      <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? 'ring-2 ring-[var(--admin-brand)]/35' : ''} ${ring}`}
                      >
                        {c.initials}
                        {muted ? (
                          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-[var(--admin-bg-elevated)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text-muted)]">
                            <BellOff className="h-2.5 w-2.5" strokeWidth={2.25} aria-hidden />
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="admin-chat-conv-title flex min-w-0 items-center gap-1.5 truncate text-sm">
                            {renderListMeta?.(c)}
                            {c.title}
                          </span>
                          <span className="admin-chat-conv-time shrink-0 text-xs">{c.timeLabel}</span>
                        </div>
                        {renderConversationBadge ? (
                          <div className="mt-0.5">{renderConversationBadge(c)}</div>
                        ) : null}
                        <p className="admin-chat-conv-preview mt-0.5 line-clamp-1 text-xs leading-snug">
                          {c.lastPreview}
                        </p>
                      </div>
                      {unread > 0 ? (
                        <span className="admin-chat-unread-badge self-center" aria-label={`${unread} unread`}>
                          {unread > 99 ? '99+' : unread}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </nav>
          </aside>

          <section className="admin-chat-thread relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--admin-bg-elevated)]">
            {selectedConv ? (
              <>
                <div className="relative z-[1] flex min-h-[2.875rem] shrink-0 flex-col border-b border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]">
                  <div className="flex items-center justify-between gap-3 px-3 sm:px-4">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      {isMobile ? (
                        <button
                          type="button"
                          onClick={() => setMobileView('list')}
                          aria-label={t('admin.chat.backToList')}
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)]"
                        >
                          <Menu className="size-5" strokeWidth={1.75} aria-hidden />
                        </button>
                      ) : null}
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${ringFor(selectedConv.id, avatarClassByParticipantId)}`}
                      >
                        {selectedConv.initials}
                      </div>
                      <div className="flex min-h-10 min-w-0 flex-col justify-center gap-0.5 py-px leading-none">
                        <div className="truncate text-sm font-bold leading-tight text-[var(--admin-text)]">
                          {selectedConv.title}
                        </div>
                        <div className="truncate text-xs font-medium leading-tight text-[var(--admin-brand)]">
                          {isMuted ? t('admin.chat.muted') : participantSubtitle}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 self-center">
                      <button
                        type="button"
                        aria-label={t('admin.chat.openSearch')}
                        aria-pressed={threadSearchOpen}
                        onClick={() => {
                          setThreadSearchOpen((v) => !v);
                          if (threadSearchOpen) setThreadSearch('');
                        }}
                        className={`inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)] ${
                          threadSearchOpen
                            ? 'bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]'
                            : 'text-[var(--admin-text-secondary)]'
                        }`}
                      >
                        <Search className="size-[18px]" strokeWidth={1.75} aria-hidden />
                      </button>
                      <ChatDropdown
                        open={threadMenuOpen}
                        onClose={() => setThreadMenuOpen(false)}
                        align="right"
                        trigger={
                          <button
                            type="button"
                            aria-label={t('admin.chat.moreActions')}
                            aria-expanded={threadMenuOpen}
                            aria-haspopup="menu"
                            onClick={() => setThreadMenuOpen((v) => !v)}
                            className={`inline-flex size-9 items-center justify-center rounded-full text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)] ${
                              threadMenuOpen ? 'bg-[var(--admin-row-hover)] text-[var(--admin-text)]' : ''
                            }`}
                          >
                            <MoreVertical className="size-[18px]" strokeWidth={1.75} aria-hidden />
                          </button>
                        }
                      >
                        <ChatMenuButton
                          icon={<CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />}
                          label={t('admin.chat.markRead')}
                          onClick={() => {
                            markConversationRead(selectedId);
                            toast.showToast(t('admin.chat.markedRead'), 'success');
                            setThreadMenuOpen(false);
                          }}
                        />
                        <ChatMenuButton
                          icon={<BellOff className="h-3.5 w-3.5" strokeWidth={2} />}
                          label={isMuted ? t('admin.chat.unmute') : t('admin.chat.mute')}
                          onClick={toggleMute}
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
                            type="search"
                            value={threadSearch}
                            onChange={(e) => setThreadSearch(e.target.value)}
                            placeholder={t('admin.chat.searchInConversation')}
                            aria-label={t('admin.chat.searchInConversation')}
                            className="admin-chat-search-input h-9 w-full rounded-full border border-solid py-0 pl-9 pr-8 text-sm"
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
                </div>

                {contextHeader}

                <div
                  ref={scrollRef}
                  className="admin-chat-messages relative z-[1] min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
                >
                  {filteredThread.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm font-medium text-[var(--admin-text-secondary)]">
                        {t('admin.chat.noMessages')}
                      </p>
                    </div>
                  ) : (
                    filteredThread.map((msg) => (
                      <div key={msg.id}>
                        {msg.separatorBefore ? (
                          <div className="mb-4 flex justify-center">
                            <span className="admin-chat-date-separator">{msg.separatorBefore}</span>
                          </div>
                        ) : null}
                        {msg.direction === 'in' ? (
                          <div className="admin-chat-msg-row admin-chat-msg-row--in">
                            <div className="max-w-[min(480px,88%)]">
                              <div
                                dir="auto"
                                className="admin-chat-bubble--in safe-chat-bubble safe-chat-message rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed"
                              >
                                {msg.text}
                              </div>
                              <div className="admin-chat-msg-time mt-1 ps-1 text-[11px]">{msg.time}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-chat-msg-row admin-chat-msg-row--out">
                            <div className="max-w-[min(480px,88%)]">
                              <div
                                dir="auto"
                                className="admin-chat-bubble--out safe-chat-bubble safe-chat-message rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed"
                              >
                                {msg.text}
                              </div>
                              <div className="admin-chat-msg-time admin-chat-msg-time--out mt-1 flex items-center justify-end gap-1 pe-1 text-[11px]">
                                <span>{msg.time}</span>
                                <CheckCheck className="admin-chat-msg-read h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {smartActionsBar}

                <footer className="admin-chat-composer-footer relative z-[1] box-border w-full max-w-full min-w-0 shrink-0 bg-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-2 md:px-5">
                  <div className="admin-chat-composer-bar box-border flex min-h-[2.375rem] w-full max-w-full min-w-0 flex-nowrap items-center gap-1.5 rounded-[1.5rem] border border-solid py-1 pl-2 pr-2.5 shadow-sm">
                    <div className="inline-flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        aria-label={t('admin.chat.attachFile')}
                        className="admin-chat-composer-icon inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--admin-brand)]/40"
                      >
                        <Paperclip className="size-4" strokeWidth={1.85} aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label={t('admin.chat.tagTemplate')}
                        className="admin-chat-composer-icon inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--admin-brand)]/40"
                      >
                        <Tag className="size-4" strokeWidth={1.85} aria-hidden />
                      </button>
                    </div>
                    <textarea
                      ref={composerRef}
                      rows={1}
                      value={draft}
                      onChange={(e) => {
                        const next = composerMaxLength
                          ? e.target.value.slice(0, composerMaxLength)
                          : e.target.value;
                        setDraft(next);
                        adjustComposerHeight();
                      }}
                      maxLength={composerMaxLength}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={composerPlaceholder}
                      aria-label={composerPlaceholder}
                      className="admin-chat-composer-textarea min-w-0 flex-1 resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!draft.trim()}
                      aria-label={t('admin.chat.sendMessage')}
                      className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center self-center rounded-full border-0 admin-btn-primary p-0 text-white outline-none transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--admin-brand)]/50"
                    >
                      <Send className="size-3.5" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </footer>
              </>
            ) : chatEmptyState ? (
              <div className="admin-chat-empty relative z-[1] flex flex-1 items-center justify-center px-6 py-8">
                <ChatEmptyState
                  title={chatEmptyState.title}
                  description={chatEmptyState.description}
                  moduleType={chatEmptyState.moduleType}
                  stats={computedEmptyStats}
                />
              </div>
            ) : (
              <div className="admin-chat-empty relative z-[1] flex flex-1 items-center justify-center text-sm font-medium">
                {emptyConversationLabel}
              </div>
            )}
          </section>
          {rightPanel}
        </div>
      </div>
    </Layout>
  );
};

export default AdminModuleChat;
