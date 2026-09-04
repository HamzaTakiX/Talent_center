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
  ArrowLeft,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Filter,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../dashboard/components/AdminLayout';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import SupportMessageComposer from '../admin-support-inbox/components/SupportMessageComposer';
import ChatSidebarHeader from '../../../shared/chat-design-system/components/ChatSidebarHeader';
import ChatUnreadBadge from '../../../shared/chat-design-system/components/ChatUnreadBadge';
import {
  toChatToolMessages,
  useChatConversationTools,
  StandardChatMessageThread,
} from '../../../shared/chat-design-system';
import type { AdminChatMessage, AdminChatParticipant } from './adminChatTypes';
import ChatEmptyState from './components/ChatEmptyState';
import type { ChatEmptyStateProps, ChatEmptyStateStats } from './types/chatEmptyStateTypes';
import type { SupervisionMeetingChatConfig } from '../../../shared/meeting-room/types/chatMeetingRequest';
import { ChatMeetingRequestBubble } from '../../../shared/meeting-room/components/chat/ChatMeetingRequestBubble';
import { ChatMeetingRequestComposerButton } from '../../../shared/meeting-room/components/chat/ChatMeetingRequestComposerButton';
import ChatComposerTagPicker from '../../../shared/contextual-chat/components/ChatComposerTagPicker';
import type { ChatModule } from '../../../shared/contextual-chat/types';
import type { ChatComposerPendingTag } from '../../../shared/contextual-chat/types/chatTagTypes';
import {
  buildOptimisticMessageAttachments,
  mapAttachmentDto,
  resolveOptimisticMessageType,
} from '../../../shared/contextual-chat/utils/mapMessageAttachments';

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
  /** Supervision chat — inline meeting request composer + message cards */
  supervisionMeeting?: SupervisionMeetingChatConfig;
  selectedConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onSendMessage?: (text: string, conversationId: string) => boolean | Promise<boolean>;
  renderConversationBadge?: (participant: AdminChatParticipant) => ReactNode;
  renderListMeta?: (participant: AdminChatParticipant) => ReactNode;
  /** Max characters allowed in composer (default: no limit) */
  composerMaxLength?: number;
  /** Module-scoped tag catalog for the composer picker */
  chatModule?: ChatModule;
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
  supervisionMeeting,
  selectedConversationId,
  onSelectConversation,
  onSendMessage,
  renderConversationBadge,
  renderListMeta,
  composerMaxLength,
  chatModule = 'platform',
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingTags, setPendingTags] = useState<ChatComposerPendingTag[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sidebarSearchRef = useRef<HTMLInputElement>(null);

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

  const hasPendingOutgoingMeetingRequest = useMemo(
    () =>
      thread.some(
        (message) =>
          message.messageType === 'MEETING_REQUEST' &&
          message.direction === 'out' &&
          message.meetingRequest?.status === 'pending',
      ),
    [thread],
  );

  const outgoingMeetingRequestNotice = useMemo(() => {
    if (!hasPendingOutgoingMeetingRequest || !selectedConv || !supervisionMeeting) {
      return null;
    }
    const noticeKey =
      supervisionMeeting.portal === 'student'
        ? 'meetingRoom.chat.alreadyPendingStudent'
        : 'meetingRoom.chat.alreadyPendingEncadrant';
    return t(noticeKey, { name: selectedConv.title });
  }, [hasPendingOutgoingMeetingRequest, selectedConv, supervisionMeeting, t]);

  const chatTools = useChatConversationTools({
    messages: toChatToolMessages(thread),
    conversationKey: selectedId,
    counterpartyName: selectedConv?.title,
    showArchive: false,
    scrollContainerRef: scrollRef,
  });

  const computedEmptyStats = useMemo((): ChatEmptyStateStats | undefined => {
    if (chatEmptyState?.stats) return chatEmptyState.stats;
    const unread = Object.values(unreadByConv).reduce((sum, count) => sum + count, 0);
    if (unread === 0) return undefined;
    return { unread };
  }, [chatEmptyState?.stats, unreadByConv]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread.length, selectedId, chatTools.searchQuery]);

  useEffect(() => {
    setUnreadByConv((prev) => ({ ...prev, [selectedId]: 0 }));
  }, [selectedId]);

  useEffect(() => {
    setPendingFiles([]);
    setPendingTags([]);
    setAttachError(null);
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


  const markConversationRead = useCallback((id: string) => {
    setUnreadByConv((prev) => ({ ...prev, [id]: 0 }));
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadByConv((prev) => Object.fromEntries(Object.keys(prev).map((id) => [id, 0])));
    toast.showToast(t('admin.chat.allMarkedRead'), 'success');
  }, [t, toast]);

  const handleSend = async () => {
    const text = draft.trim();
    if ((!text && !pendingFiles.length) || !selectedId) return;

    const filesToSend = [...pendingFiles];
    const tagCodes = pendingTags.map((tag) => tag.code);
    const optimisticAttachments = filesToSend.length
      ? buildOptimisticMessageAttachments(filesToSend).map(mapAttachmentDto)
      : undefined;
    const messageType = resolveOptimisticMessageType(filesToSend, text);

    if (onSendMessage) {
      const ok = await onSendMessage(text, selectedId);
      if (!ok) return;
    } else {
      const msg: AdminChatMessage = {
        id: `local-${Date.now()}`,
        direction: 'out',
        text,
        time: formatNowTime(i18n.language),
        messageType: messageType as AdminChatMessage['messageType'],
        attachments: optimisticAttachments,
        tags: tagCodes.length ? tagCodes : undefined,
      };
      setMessagesByConv((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), msg],
      }));
    }
    setDraft('');
    setPendingFiles([]);
    setPendingTags([]);
    setAttachError(null);
    const preview =
      text ||
      (optimisticAttachments?.length === 1
        ? optimisticAttachments[0].filename
        : optimisticAttachments?.length
          ? t('shared.chat.attachments.pending', { defaultValue: 'Attachments' })
          : '');
    const nowLbl = formatNowTime(i18n.language);
    setConversationRows((rows) =>
      rows.map((r) => (r.id === selectedId ? { ...r, lastPreview: preview, timeLabel: nowLbl } : r))
    );
  };

  const handleSendMeetingRequest = useCallback(() => {
    if (!selectedId || !supervisionMeeting || !selectedConv) return;
    if (hasPendingOutgoingMeetingRequest) return;

    const requestId = `mr-${Date.now()}`;
    const msg: AdminChatMessage = {
      id: `local-${requestId}`,
      direction: 'out',
      text: t('meetingRoom.chat.requestPreview'),
      time: formatNowTime(i18n.language),
      messageType: 'MEETING_REQUEST',
      meetingRequest: {
        requestId,
        mode: 'video',
        status: 'pending',
        title: t('meetingRoom.withParticipant', { name: selectedConv.title }),
      },
    };
    setMessagesByConv((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }));
    const preview = t('meetingRoom.chat.requestPreview');
    const nowLbl = formatNowTime(i18n.language);
    setConversationRows((rows) =>
      rows.map((r) => (r.id === selectedId ? { ...r, lastPreview: preview, timeLabel: nowLbl } : r))
    );
  }, [
    hasPendingOutgoingMeetingRequest,
    i18n.language,
    selectedConv,
    selectedId,
    supervisionMeeting,
    t,
  ]);

  const handleMeetingRequestAccepted = useCallback(
    (requestId: string) => {
      if (!selectedId) return;
      setMessagesByConv((prev) => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).map((message) =>
          message.meetingRequest?.requestId === requestId
            ? {
                ...message,
                meetingRequest: {
                  ...message.meetingRequest,
                  status: 'accepted' as const,
                },
              }
            : message,
        ),
      }));
    },
    [selectedId],
  );

  const selectConversation = (c: AdminChatParticipant) => {
    setSelectedId(c.id);
    onSelectConversation?.(c.id);
    markConversationRead(c.id);
    if (isMobile) setMobileView('thread');
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
          <aside className="isi-sidebar admin-chat-sidebar w-full shrink-0 sm:w-[320px]">
            <ChatSidebarHeader
              title={t('admin.chat.conversations', { defaultValue: 'Conversations' })}
              icon={MessageSquare}
              actions={
                <ChatDropdown
                  open={sidebarMenuOpen}
                  onClose={() => setSidebarMenuOpen(false)}
                  align="right"
                  trigger={
                    <button
                      type="button"
                      aria-label={t('admin.chat.sidebarMenu')}
                      aria-expanded={sidebarMenuOpen}
                      aria-haspopup="menu"
                      onClick={() => setSidebarMenuOpen((v) => !v)}
                      className={`isi-filter-toggle ${sidebarMenuOpen ? 'isi-filter-toggle--active' : ''}`}
                    >
                      <Filter className="size-4" strokeWidth={2} />
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
              }
            />

            <div className="isi-search-wrap">
              <label className="admin-header-search-field isi-search-field">
                <Search className="admin-header-search-icon" strokeWidth={2} aria-hidden />
                <input
                  ref={sidebarSearchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="admin-input admin-header-search-input isi-search-input"
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                />
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      sidebarSearchRef.current?.focus();
                    }}
                    className="admin-header-search-clear"
                    aria-label={t('admin.chat.clearSearch')}
                  >
                    <X className="size-3.5" strokeWidth={2.25} />
                  </button>
                ) : null}
              </label>
            </div>

            <nav className="isi-conv-list" aria-label={searchPlaceholder}>
              {filteredConversations.length === 0 ? (
                <div className="isi-conv-empty">
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
                      className={`isi-conv-item ${active ? 'isi-conv-item--active' : ''}`}
                    >
                      <div className={`isi-avatar relative ${ring}`}>
                        {c.initials}
                        {muted ? (
                          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-[var(--admin-bg-elevated)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text-muted)]">
                            <BellOff className="h-2.5 w-2.5" strokeWidth={2.25} aria-hidden />
                          </span>
                        ) : null}
                      </div>
                      <div className="isi-conv-body">
                        <div className="isi-conv-row">
                          <span className="isi-conv-name">
                            {renderListMeta?.(c)}
                            {c.title}
                          </span>
                          <span className="isi-conv-time">{c.timeLabel}</span>
                        </div>
                        {renderConversationBadge ? (
                          <div className="mt-0.5">{renderConversationBadge(c)}</div>
                        ) : null}
                        <p className="isi-conv-preview">{c.lastPreview}</p>
                      </div>
                      <ChatUnreadBadge count={unread} />
                    </button>
                  );
                })
              )}
            </nav>
          </aside>

          <section className="isi-chat admin-chat-thread relative min-w-0 flex-1">
            {selectedConv ? (
              <>
                <header className="isi-chat-header">
                  <div className="isi-chat-header-left">
                    {isMobile ? (
                      <button
                        type="button"
                        onClick={() => setMobileView('list')}
                        aria-label={t('admin.chat.backToList')}
                        className="isi-icon-btn lg:hidden"
                      >
                        <ArrowLeft className="size-5" strokeWidth={2} />
                      </button>
                    ) : null}
                    <div className="isi-chat-header-main min-w-0">
                      <div className="isi-chat-header-identity">
                        <div className={`isi-avatar isi-avatar--header ${ringFor(selectedConv.id, avatarClassByParticipantId)}`}>
                          {selectedConv.initials}
                        </div>
                        <h2 className="isi-chat-name truncate">{selectedConv.title}</h2>
                      </div>
                      <p className="isi-chat-meta truncate">
                        {isMuted ? t('admin.chat.muted') : participantSubtitle}
                      </p>
                    </div>
                  </div>
                  <div className="isi-chat-actions">{chatTools.menu}</div>
                </header>

                {chatTools.searchBar}

                {contextHeader}

                <div ref={scrollRef} className="isi-messages">
                  <StandardChatMessageThread
                    messages={thread}
                    inboxMode="admin"
                    emptyLabel={t('admin.chat.noMessages')}
                    getMessageBlockProps={chatTools.getMessageBlockProps}
                    renderHighlightedText={chatTools.renderHighlightedText}
                    renderMeetingRequest={
                      supervisionMeeting
                        ? (message) =>
                            message.meetingRequest ? (
                              <ChatMeetingRequestBubble
                                direction={message.direction ?? 'in'}
                                partnerName={selectedConv?.title ?? ''}
                                meetingRequest={message.meetingRequest}
                                portal={supervisionMeeting.portal}
                                studentProfileId={supervisionMeeting.studentProfileId}
                                onAccepted={handleMeetingRequestAccepted}
                              />
                            ) : null
                        : undefined
                    }
                  />
                </div>

                {chatTools.panels}

                {smartActionsBar}

                {outgoingMeetingRequestNotice ? (
                  <div
                    role="status"
                    className="mx-3 mb-2 rounded-[10px] border border-[color-mix(in_srgb,var(--admin-brand)_24%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-brand)_8%,var(--admin-bg-elevated))] px-3 py-2 text-sm leading-5 text-[var(--admin-text-secondary)]"
                  >
                    {outgoingMeetingRequestNotice}
                  </div>
                ) : null}

                <SupportMessageComposer
                  value={draft}
                  onChange={setDraft}
                  onSend={() => void handleSend()}
                  placeholder={composerPlaceholder}
                  inputAriaLabel={composerPlaceholder}
                  attachAriaLabel={t('admin.chat.attachFile')}
                  sendAriaLabel={t('admin.chat.sendMessage')}
                  maxLength={composerMaxLength}
                  showVoice={false}
                  pendingFiles={pendingFiles}
                  onPendingFilesChange={setPendingFiles}
                  pendingTags={pendingTags}
                  onRemovePendingTag={(code) =>
                    setPendingTags((prev) => prev.filter((tag) => tag.code !== code))
                  }
                  attachError={attachError}
                  onAttachError={setAttachError}
                  extraActions={
                    <>
                      {supervisionMeeting ? (
                        <ChatMeetingRequestComposerButton
                          disabled={!selectedId || hasPendingOutgoingMeetingRequest}
                          onClick={handleSendMeetingRequest}
                          tooltipLabel={
                            hasPendingOutgoingMeetingRequest
                              ? t('meetingRoom.chat.alreadyPendingTooltip')
                              : undefined
                          }
                        />
                      ) : null}
                      <ChatComposerTagPicker
                        chatModule={chatModule}
                        enabled
                        disabled={!selectedId}
                        selectedCodes={pendingTags.map((tag) => tag.code)}
                        onChange={setPendingTags}
                      />
                    </>
                  }
                />
              </>
            ) : chatEmptyState ? (
              <div className="isi-chat isi-chat--empty">
                <ChatEmptyState
                  title={chatEmptyState.title}
                  description={chatEmptyState.description}
                  moduleType={chatEmptyState.moduleType}
                  stats={computedEmptyStats}
                />
              </div>
            ) : (
              <div className="isi-chat isi-chat--empty">
                <p className="text-sm font-medium text-[var(--admin-text-muted)]">{emptyConversationLabel}</p>
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
