import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCheck,
  Menu,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Tag,
} from 'lucide-react';
import EncadrantLayout from '../../components/EncadrantLayout';
import { ENCADRANT_CHAT_FLUSH_ROOT } from '../constants/chatLayout';
import type { ChatMessage, ChatParticipant } from '../types';
import { formatNowTime, ringFor } from '../utils/chatUi';

export interface EncadrantModuleChatProps {
  participantsSeed: ChatParticipant[];
  initialMessages: Record<string, ChatMessage[]>;
  participantSubtitle?: string;
  avatarClassByParticipantId?: Record<string, string>;
  searchPlaceholder?: string;
  composerPlaceholder?: string;
  emptyConversationLabel?: string;
}

const EncadrantModuleChat: FunctionComponent<EncadrantModuleChatProps> = ({
  participantsSeed,
  initialMessages,
  participantSubtitle = 'student • supervision',
  avatarClassByParticipantId,
  searchPlaceholder = 'Search',
  composerPlaceholder = 'Type a message...',
  emptyConversationLabel = 'Select a conversation',
}) => {
  const [conversationRows, setConversationRows] = useState<ChatParticipant[]>(() =>
    participantsSeed.map((c) => ({ ...c }))
  );
  const [selectedId, setSelectedId] = useState(participantsSeed[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [messagesByConv, setMessagesByConv] = useState<Record<string, ChatMessage[]>>(() => ({
    ...initialMessages,
  }));
  const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>(() =>
    Object.fromEntries(participantsSeed.map((c) => [c.id, c.unreadCount]))
  );
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversationRows.find((c) => c.id === selectedId);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversationRows;
    return conversationRows.filter(
      (c) => c.title.toLowerCase().includes(q) || c.lastPreview.toLowerCase().includes(q)
    );
  }, [search, conversationRows]);

  const thread = messagesByConv[selectedId] ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread.length, selectedId]);

  useEffect(() => {
    setUnreadByConv((prev) => ({ ...prev, [selectedId]: 0 }));
  }, [selectedId]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !selectedId) return;
    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      direction: 'out',
      text,
      time: formatNowTime(),
    };
    setMessagesByConv((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }));
    setDraft('');
    const nowLbl = formatNowTime();
    setConversationRows((rows) =>
      rows.map((r) => (r.id === selectedId ? { ...r, lastPreview: text, timeLabel: nowLbl } : r))
    );
  };

  const selectConversation = (c: ChatParticipant) => {
    setSelectedId(c.id);
    setUnreadByConv((prev) => ({ ...prev, [c.id]: 0 }));
    setMobileThreadOpen(true);
  };

  const backToConversationList = () => {
    setMobileThreadOpen(false);
  };

  return (
    <EncadrantLayout headerTitle="Chat" headerSubtitle="Encadrant Portal">
      <div
        id="encadrant-chat-root"
        className={`${ENCADRANT_CHAT_FLUSH_ROOT} flex min-h-0 flex-1 flex-col`}
      >
        <div className="flex min-h-0 flex-1 overflow-hidden bg-white">
          <aside
            className={`flex h-full min-h-0 shrink-0 flex-col border-r border-solid border-neutral-200 bg-white ${
              mobileThreadOpen
                ? 'hidden sm:flex sm:w-[clamp(260px,32vw,340px)]'
                : 'flex w-full min-w-0 sm:w-[clamp(260px,32vw,340px)]'
            }`}
          >
            <div className="flex min-h-[2.875rem] shrink-0 items-center gap-2 border-b border-solid border-neutral-100 px-2.5">
              <button
                type="button"
                aria-label="Menu"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#404040] transition-colors hover:bg-neutral-100 sm:hidden"
              >
                <Menu className="size-5" strokeWidth={1.75} aria-hidden />
              </button>
              <div className="relative flex min-h-[2.25rem] min-w-0 flex-1 items-center">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="box-border inline-flex h-9 min-h-[2.25rem] w-full min-w-0 items-center rounded-full border-0 bg-[#f4f4f5] px-3.5 text-sm leading-normal text-[#0a0a0a] placeholder:text-[#717182] align-middle outline-none ring-2 ring-transparent focus:bg-[#ececee] focus:ring-[#2b7fff]/20"
                />
              </div>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              {filteredConversations.map((c) => {
                const unread = unreadByConv[c.id] ?? 0;
                const active = c.id === selectedId;
                const ring = ringFor(c.id, avatarClassByParticipantId);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectConversation(c)}
                    className={`flex w-full min-w-0 items-start gap-2.5 border-b border-solid border-neutral-100 px-2.5 py-2.5 text-left transition-colors ${
                      active ? 'bg-[#2b7fff] text-white' : 'bg-white hover:bg-[#f5f5f5]'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? 'ring-2 ring-white/40' : ''} ${ring}`}
                    >
                      {c.initials}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`truncate text-sm font-semibold ${active ? 'text-white' : 'text-[#0a0a0a]'}`}
                        >
                          {c.title}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-medium ${active ? 'text-white/90' : 'text-[#717182]'}`}
                        >
                          {c.timeLabel}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 line-clamp-1 text-xs leading-snug ${active ? 'text-white/85' : 'text-[#525252]'}`}
                      >
                        {c.lastPreview}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span
                        className={`mt-1 flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          active ? 'bg-white text-[#2b7fff]' : 'bg-[#2b7fff] text-white'
                        }`}
                      >
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section
            className={`relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-white ${
              mobileThreadOpen ? 'flex' : 'hidden sm:flex'
            }`}
          >
            {selectedConv ? (
              <>
                <div className="relative z-[1] flex min-h-[2.875rem] shrink-0 items-center justify-between gap-2 border-b border-solid border-neutral-200 bg-white px-3 sm:gap-3 sm:px-4">
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={backToConversationList}
                      aria-label="Back to conversations"
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#404040] transition-colors hover:bg-black/5 sm:hidden"
                    >
                      <ArrowLeft className="size-5" strokeWidth={1.75} aria-hidden />
                    </button>
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${ringFor(selectedConv.id, avatarClassByParticipantId)}`}
                    >
                      {selectedConv.initials}
                    </div>
                    <div className="flex min-h-10 min-w-0 flex-col justify-center gap-0.5 py-px leading-none">
                      <div className="truncate text-sm font-bold leading-tight text-[#0a0a0a]">
                        {selectedConv.title}
                      </div>
                      <div className="truncate text-xs font-medium leading-tight text-[#2b7fff]">
                        {participantSubtitle}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 self-center">
                    <button
                      type="button"
                      aria-label="Search in conversation"
                      className="inline-flex size-9 items-center justify-center rounded-full text-[#404040] transition-colors hover:bg-black/5"
                    >
                      <Search className="size-[18px]" strokeWidth={1.75} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="More actions"
                      className="inline-flex size-9 items-center justify-center rounded-full text-[#404040] transition-colors hover:bg-black/5"
                    >
                      <MoreVertical className="size-[18px]" strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="relative z-[1] min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 sm:px-4"
                >
                  {thread.map((msg) => (
                    <div key={msg.id}>
                      {msg.separatorBefore ? (
                        <div className="mb-4 flex justify-center">
                          <span className="rounded-full bg-black/12 px-3 py-1 text-[11px] font-medium text-[#3f3f46] backdrop-blur-sm">
                            {msg.separatorBefore}
                          </span>
                        </div>
                      ) : null}
                      {msg.direction === 'in' ? (
                        <div className="flex justify-start">
                          <div className="max-w-[min(480px,88%)]">
                            <div className="rounded-2xl rounded-bl-md border border-solid border-neutral-200/80 bg-[#f4f4f5] px-3.5 py-2.5 text-sm leading-relaxed text-[#0a0a0a] shadow-sm">
                              {msg.text}
                            </div>
                            <div className="mt-1 pl-1 text-[11px] font-medium text-[#64748b]">{msg.time}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <div className="max-w-[min(480px,88%)]">
                            <div className="rounded-2xl rounded-br-md bg-[#2b7fff] px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm">
                              {msg.text}
                            </div>
                            <div className="mt-1 flex items-center justify-end gap-1 pr-1 text-[11px] font-medium text-[#64748b]">
                              <span>{msg.time}</span>
                              <CheckCheck className="h-3.5 w-3.5 text-[#2b7fff]" strokeWidth={2.25} aria-hidden />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <footer className="relative z-[1] box-border w-full max-w-full min-w-0 shrink-0 bg-transparent px-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-2 sm:px-4 md:px-5">
                  <div className="box-border flex min-h-[2.375rem] w-full max-w-full min-w-0 items-center gap-1.5 rounded-[1.5rem] border border-solid border-neutral-200 bg-white py-1 pl-2 pr-2.5 shadow-sm">
                    <div className="inline-flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        aria-label="Attach file"
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#52525b] outline-none transition-colors hover:bg-neutral-100 hover:text-[#171717] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#2b7fff]/40"
                      >
                        <Paperclip className="size-4" strokeWidth={1.85} aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Tag or template"
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#52525b] outline-none transition-colors hover:bg-neutral-100 hover:text-[#171717] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#2b7fff]/40"
                      >
                        <Tag className="size-4" strokeWidth={1.85} aria-hidden />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={composerPlaceholder}
                      className="min-h-8 min-w-0 flex-1 cursor-text self-center border-0 bg-transparent py-0 pl-1 pr-1 text-sm leading-8 text-[#0a0a0a] placeholder:text-[#9ca3af] outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      aria-label="Send"
                      className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center self-center rounded-full border-0 bg-[#0a0a0a] p-0 text-white outline-none transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#2b7fff]/50"
                    >
                      <Send className="size-3.5" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="relative z-[1] flex flex-1 items-center justify-center px-4 text-center text-sm font-medium text-[#64748b]">
                {emptyConversationLabel}
              </div>
            )}
          </section>
        </div>
      </div>
    </EncadrantLayout>
  );
};

export default EncadrantModuleChat;
