import { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CoachContextData,
  CoachConversation,
  CoachMessage,
  CoachMode,
  CoachOfferContext,
  MessageQuickAction,
} from '../types/careerCoach';
import { getModeConfig } from '../data/careerCoachMock';
import {
  createCareerCoachSession,
  deleteCareerCoachSession,
  fetchCareerCoachHistory,
  fetchCareerCoachSessions,
  renameCareerCoachSession,
  setCareerCoachSessionArchived,
  streamCareerCoachMessage,
  type CareerCoachMessageDto,
  type CareerCoachSessionDto,
} from '../api/careerCoachApi';

const EMPTY_CONTEXT: CoachContextData = {
  cvFileName: '',
  hasCv: false,
  hasAnalysis: false,
  cvScore: 0,
  atsScore: 0,
  lastAnalysis: '',
  readinessPercent: 0,
  focusAreas: [],
  activeGoals: [],
};

const OFFER_CONTEXT_BY_SESSION_STORAGE_KEY = 'careerCoachOfferContextBySession';
const OFFER_CONTEXT_BY_SESSION_LOCAL_STORAGE_KEY = 'careerCoachOfferContextBySessionLocal';
const ACTIVE_SESSION_STORAGE_KEY = 'careerCoachActiveSessionId';
const OFFER_CONTEXT_BLOCK_REGEX = /\[OFFER_CONTEXT\][\s\S]*?\[\/OFFER_CONTEXT\]\s*/g;
const OFFER_CONTEXT_CAPTURE_REGEX = /\[OFFER_CONTEXT\]([\s\S]*?)\[\/OFFER_CONTEXT\]/i;

function normalizeSessionId(sessionId: string): string {
  return String(sessionId).trim();
}

function readOfferContextBySessionFromStorage(): Record<string, CoachOfferContext> {
  const mergeCandidate = (
    target: Record<string, CoachOfferContext>,
    candidate: unknown,
  ): Record<string, CoachOfferContext> => {
    if (!candidate || typeof candidate !== 'object') return target;
    return { ...target, ...(candidate as Record<string, CoachOfferContext>) };
  };

  if (typeof window === 'undefined') return {};
  try {
    let merged: Record<string, CoachOfferContext> = {};

    const raw = window.sessionStorage.getItem(OFFER_CONTEXT_BY_SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      merged = mergeCandidate(merged, parsed);
    }

    const rawLocal = window.localStorage.getItem(OFFER_CONTEXT_BY_SESSION_LOCAL_STORAGE_KEY);
    if (rawLocal) {
      const parsedLocal = JSON.parse(rawLocal);
      merged = mergeCandidate(merged, parsedLocal);
    }

    return merged;
  } catch {
    return {};
  }
}

function persistOfferContextForSession(sessionId: string, offerContext: CoachOfferContext | undefined): void {
  if (typeof window === 'undefined' || !offerContext) return;
  try {
    const map = readOfferContextBySessionFromStorage();
    map[sessionId] = offerContext;
    window.sessionStorage.setItem(OFFER_CONTEXT_BY_SESSION_STORAGE_KEY, JSON.stringify(map));
    window.localStorage.setItem(OFFER_CONTEXT_BY_SESSION_LOCAL_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failure; in-memory state still works.
  }
}

function removeOfferContextForSession(sessionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const map = readOfferContextBySessionFromStorage();
    if (!(sessionId in map)) return;
    delete map[sessionId];
    window.sessionStorage.setItem(OFFER_CONTEXT_BY_SESSION_STORAGE_KEY, JSON.stringify(map));
    window.localStorage.setItem(OFFER_CONTEXT_BY_SESSION_LOCAL_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failure.
  }
}

function readActiveSessionIdFromStorage(): string {
  if (typeof window === 'undefined') return '';
  try {
    return normalizeSessionId(window.sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) || '');
  } catch {
    return '';
  }
}

function persistActiveSessionId(sessionId: string): void {
  if (typeof window === 'undefined' || !sessionId) return;
  try {
    window.sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, normalizeSessionId(sessionId));
  } catch {
    // Ignore storage failure.
  }
}

function resolveOfferContextForSession(
  sessionId: string,
  offerContext?: CoachOfferContext,
): CoachOfferContext | undefined {
  if (offerContext) return offerContext;
  return readOfferContextBySessionFromStorage()[normalizeSessionId(sessionId)];
}

function stripOfferGroundingMessage(message: string | undefined | null): string {
  if (!message) return '';
  return message.replace(OFFER_CONTEXT_BLOCK_REGEX, '').trim();
}

function parseOfferContextFromMessage(message: string | undefined | null): CoachOfferContext | undefined {
  if (!message) return undefined;
  const match = message.match(OFFER_CONTEXT_CAPTURE_REGEX);
  if (!match?.[1]) return undefined;

  const block = match[1];
  const fields: CoachOfferContext = {};

  for (const rawLine of block.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const separatorIndex = line.indexOf(':');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    if (!value || value === '-') continue;

    if (key === 'offer_id' || key === 'offerid') fields.offerId = value;
    else if (key === 'title') fields.title = value;
    else if (key === 'company') fields.company = value;
    else if (key === 'company_logo_url' || key === 'companylogourl') fields.companyLogoUrl = value;
    else if (key === 'internship_type') fields.internshipType = value;
    else if (key === 'deadline') fields.deadline = value;
    else if (key === 'application_status') fields.applicationStatus = value;
    else if (key === 'applied_date') fields.appliedDate = value;
    else if (key === 'interview_date') fields.interviewDate = value;
  }

  if (
    !fields.offerId &&
    !fields.title &&
    !fields.company &&
    !fields.companyLogoUrl &&
    !fields.internshipType &&
    !fields.deadline &&
    !fields.applicationStatus &&
    !fields.appliedDate &&
    !fields.interviewDate
  ) {
    return undefined;
  }
  return fields;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseOfferContextFromMetadata(metadata: Record<string, unknown> | undefined): CoachOfferContext | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;
  const source = metadata as Record<string, unknown>;

  const rawOfferContext =
    (source.offer_context as Record<string, unknown> | undefined) ||
    (source.offerContext as Record<string, unknown> | undefined);

  const normalizedSource = rawOfferContext && typeof rawOfferContext === 'object' ? rawOfferContext : source;

  const parsed: CoachOfferContext = {
    offerId: asString(normalizedSource.offer_id) || asString(normalizedSource.offerId),
    title: asString(normalizedSource.title),
    company: asString(normalizedSource.company),
    companyLogoUrl:
      asString(normalizedSource.company_logo_url) || asString(normalizedSource.companyLogoUrl),
    internshipType:
      asString(normalizedSource.internship_type) || asString(normalizedSource.internshipType),
    deadline: asString(normalizedSource.deadline),
    applicationStatus:
      asString(normalizedSource.application_status) || asString(normalizedSource.applicationStatus),
    appliedDate: asString(normalizedSource.applied_date) || asString(normalizedSource.appliedDate),
    interviewDate:
      asString(normalizedSource.interview_date) || asString(normalizedSource.interviewDate),
  };

  if (
    !parsed.offerId &&
    !parsed.title &&
    !parsed.company &&
    !parsed.companyLogoUrl &&
    !parsed.internshipType &&
    !parsed.deadline &&
    !parsed.applicationStatus &&
    !parsed.appliedDate &&
    !parsed.interviewDate
  ) {
    return undefined;
  }

  return parsed;
}

function mapSessionDto(session: CareerCoachSessionDto): CoachConversation {
  const sessionId = normalizeSessionId(session.session_id);
  const safeTitle = stripOfferGroundingMessage(session.title || '');
  const safePreview = stripOfferGroundingMessage(session.preview || '');
  return {
    id: sessionId,
    title: safeTitle,
    preview: safePreview,
    messageCount: session.message_count,
    mode: session.mode,
    messages: [],
    updatedAt: new Date(session.updated_at).getTime(),
    archived: session.is_archived,
  };
}

function mapMessageDto(message: CareerCoachMessageDto): CoachMessage | null {
  if (message.role !== 'user' && message.role !== 'assistant') return null;
  const messageText =
    message.role === 'user' ? stripOfferGroundingMessage(message.message) : message.message;
  return {
    id: String(message.id),
    role: message.role,
    mode: message.mode,
    text: messageText,
  };
}

function deriveConversationTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

function buildOfferGroundingMessage(
  userMessage: string,
  offerContext?: CoachOfferContext,
): string {
  const trimmed = userMessage.trim();
  if (!offerContext) return trimmed;

  const offerId = offerContext.offerId?.trim();
  const title = offerContext.title?.trim();
  const company = offerContext.company?.trim();
  const companyLogoUrl = offerContext.companyLogoUrl?.trim();
  const internshipType = offerContext.internshipType?.trim();
  const deadline = offerContext.deadline?.trim();
  const applicationStatus = offerContext.applicationStatus?.trim();
  const appliedDate = offerContext.appliedDate?.trim();
  const interviewDate = offerContext.interviewDate?.trim();

  if (
    !offerId &&
    !title &&
    !company &&
    !companyLogoUrl &&
    !internshipType &&
    !deadline &&
    !applicationStatus &&
    !appliedDate &&
    !interviewDate
  ) {
    return trimmed;
  }

  const offerContextBlock = [
    '[OFFER_CONTEXT]',
    `offer_id: ${offerId || '-'}`,
    `title: ${title || '-'}`,
    `company: ${company || '-'}`,
    `company_logo_url: ${companyLogoUrl || '-'}`,
    `internship_type: ${internshipType || '-'}`,
    `deadline: ${deadline || '-'}`,
    `application_status: ${applicationStatus || '-'}`,
    `applied_date: ${appliedDate || '-'}`,
    `interview_date: ${interviewDate || '-'}`,
    'Use this offer context as the primary reference for this conversation.',
    '[/OFFER_CONTEXT]',
  ].join('\n');

  return `${offerContextBlock}\n\n${trimmed}`;
}

function dedupeConversationsById(items: CoachConversation[]): CoachConversation[] {
  const storedOfferContextBySession = readOfferContextBySessionFromStorage();
  const byId = new Map<string, CoachConversation>();
  for (const item of items) {
    const id = normalizeSessionId(item.id);
    const existing = byId.get(id);
    const storedOfferContext = storedOfferContextBySession[id];
    if (!existing || item.updatedAt > existing.updatedAt) {
      byId.set(id, {
        ...item,
        offerContext: item.offerContext ?? existing?.offerContext ?? storedOfferContext,
      });
      continue;
    }
    byId.set(id, {
      ...existing,
      offerContext: existing.offerContext ?? item.offerContext ?? storedOfferContext,
    });
  }
  return Array.from(byId.values());
}

export function useCareerCoachChat(options?: { skipInitialHistory?: boolean }) {
  const skipInitialHistory = options?.skipInitialHistory ?? false;
  const [conversations, setConversations] = useState<CoachConversation[]>([]);
  const [context, setContext] = useState<CoachContextData>(EMPTY_CONTEXT);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const archivedLoadedRef = useRef(false);
  const historyLoadedRef = useRef<Set<string>>(new Set());

  const activeConversation = useMemo(() => {
    const normalizedActiveId = normalizeSessionId(activeConversationId);
    if (normalizedActiveId) {
      const match = conversations.find((conversation) => normalizeSessionId(conversation.id) === normalizedActiveId);
      if (match) return match;
    }
    return conversations[0];
  }, [conversations, activeConversationId]);

  const activeOfferContext = useMemo(() => {
    const fromConversation = activeConversation?.offerContext;
    if (fromConversation) return fromConversation;
    const sessionId = normalizeSessionId(activeConversationId || activeConversation?.id || '');
    if (!sessionId) return undefined;
    return readOfferContextBySessionFromStorage()[sessionId];
  }, [activeConversation, activeConversationId]);

  const mode = activeConversation?.mode ?? 'career-coach';
  const messages = activeConversation?.messages ?? [];
  const modeConfig = getModeConfig(mode);

  const mergeSessions = useCallback((sessions: CareerCoachSessionDto[]) => {
    setConversations((prev) => {
      const byId = new Map(prev.map((conversation) => [normalizeSessionId(conversation.id), conversation]));
      for (const session of sessions) {
        const sessionId = normalizeSessionId(session.session_id);
        const existing = byId.get(sessionId);
        byId.set(sessionId, {
          ...mapSessionDto(session),
          messages: existing?.messages ?? [],
          offerContext: resolveOfferContextForSession(sessionId, existing?.offerContext),
        });
      }
      return Array.from(byId.values());
    });
  }, []);

  const loadHistory = useCallback(async (sessionId: string) => {
    if (historyLoadedRef.current.has(sessionId)) return;
    setIsHistoryLoading(true);
    try {
      const history = await fetchCareerCoachHistory(sessionId);
      let parsedOfferContext: CoachOfferContext | undefined;
      const mapped = history
        .map((message) => {
          if (!parsedOfferContext) {
            parsedOfferContext = parseOfferContextFromMetadata(message.metadata);
          }
          if (!parsedOfferContext && message.role === 'user') {
            parsedOfferContext = parseOfferContextFromMessage(message.message);
          }
          return mapMessageDto(message);
        })
        .filter((message): message is CoachMessage => message !== null);

      historyLoadedRef.current.add(sessionId);
      setConversations((prev) =>
        prev.map((conversation) => {
          if (normalizeSessionId(conversation.id) !== sessionId) return conversation;
          const resolvedOfferContext =
            conversation.offerContext ?? resolveOfferContextForSession(sessionId, parsedOfferContext);
          if (resolvedOfferContext) {
            persistOfferContextForSession(sessionId, resolvedOfferContext);
          }
          return {
            ...conversation,
            messages: mapped,
            offerContext: resolvedOfferContext,
          };
        }),
      );
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const refreshSessions = useCallback(
    async (archived: boolean) => {
      const sessions = await fetchCareerCoachSessions(archived);
      mergeSessions(sessions);
      return sessions;
    },
    [mergeSessions],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsSessionsLoading(true);
      try {
        const sessions = await fetchCareerCoachSessions(false);
        if (cancelled) return;

        if (sessions.length > 0) {
          mergeSessions(sessions);
          const storedActiveId = readActiveSessionIdFromStorage();
          const availableIds = new Set(sessions.map((session) => normalizeSessionId(session.session_id)));
          const nextActiveId =
            storedActiveId && availableIds.has(storedActiveId)
              ? storedActiveId
              : normalizeSessionId(sessions[0].session_id);
          setActiveConversationId(nextActiveId);
          persistActiveSessionId(nextActiveId);
          if (!skipInitialHistory) {
            void loadHistory(nextActiveId);
          }
        }

        setApiUnavailable(false);
      } catch {
        if (!cancelled) setApiUnavailable(true);
      } finally {
        if (!cancelled) setIsSessionsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [loadHistory, mergeSessions, skipInitialHistory]);

  useEffect(() => {
    if (!showArchived || archivedLoadedRef.current) return;

    let cancelled = false;
    void (async () => {
      try {
        await refreshSessions(true);
        if (!cancelled) archivedLoadedRef.current = true;
      } catch {
        if (!cancelled) setApiUnavailable(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshSessions, showArchived]);

  const updateConversationById = useCallback(
    (id: string, updater: (conversation: CoachConversation) => CoachConversation) => {
      setConversations((prev) =>
        prev.map((conversation) => (conversation.id === id ? updater(conversation) : conversation)),
      );
    },
    [],
  );

  const resolveNextActiveId = useCallback(
    (remaining: CoachConversation[], removedId: string, currentActiveId: string) => {
      if (currentActiveId !== removedId) return currentActiveId;
      const next = remaining.find((conversation) => !conversation.archived) ?? remaining[0];
      return next?.id ?? '';
    },
    [],
  );

  const setMode = useCallback(
    (nextMode: CoachMode) => {
      updateConversationById(activeConversationId, (conversation) => ({
        ...conversation,
        mode: nextMode,
        updatedAt: Date.now(),
      }));
    },
    [activeConversationId, updateConversationById],
  );

  const sendUserMessage = useCallback(
    async (text: string, attachment?: File | null, activeMode: CoachMode = mode) => {
      const trimmed = text.trim();
      const messageText = trimmed || attachment?.name || '';
      if (!messageText) return;

      let sessionId = activeConversationId;
      let conversationOfferContext = resolveOfferContextForSession(
        sessionId,
        activeConversation?.offerContext ?? activeOfferContext,
      );
      if (!sessionId) {
        try {
          const created = await createCareerCoachSession(activeMode);
          const mapped = mapSessionDto(created);
          setConversations((prev) => [mapped, ...prev]);
          const createdSessionId = normalizeSessionId(created.session_id);
          setActiveConversationId(createdSessionId);
          persistActiveSessionId(createdSessionId);
          historyLoadedRef.current.add(createdSessionId);
          sessionId = createdSessionId;
          conversationOfferContext = mapped.offerContext;
        } catch {
          setApiUnavailable(true);
          return;
        }
      }

      const apiMessageText = buildOfferGroundingMessage(messageText, conversationOfferContext);

      const optimisticUser: CoachMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        mode: activeMode,
        text: trimmed || undefined,
        attachmentName: attachment?.name,
      };

      const streamId = `a-stream-${Date.now()}`;

      updateConversationById(sessionId, (conversation) => ({
        ...conversation,
        mode: activeMode,
        title: conversation.title || deriveConversationTitle(messageText),
        messages: [
          ...conversation.messages,
          optimisticUser,
          {
            id: streamId,
            role: 'assistant',
            mode: activeMode,
            text: '',
            isStreaming: true,
          },
        ],
        updatedAt: Date.now(),
      }));

      setChatInput('');
      setPendingAttachment(null);

      try {
        let fullText = '';
        await streamCareerCoachMessage(
          { message: apiMessageText, sessionId, mode: activeMode },
          (event) => {
            if (event.type === 'token') {
              fullText += event.content;
              updateConversationById(sessionId, (conversation) => ({
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.id === streamId
                    ? { ...message, text: fullText, isStreaming: true }
                    : message,
                ),
              }));
            } else if (event.type === 'done') {
              updateConversationById(sessionId, (conversation) => ({
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.id === streamId
                    ? {
                        ...message,
                        id: String(event.assistant_message_id),
                        text: event.response || fullText,
                        isStreaming: false,
                      }
                    : message,
                ),
                updatedAt: Date.now(),
              }));
            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          },
        );
        setApiUnavailable(false);
      } catch {
        setApiUnavailable(true);
        updateConversationById(sessionId, (conversation) => ({
          ...conversation,
          messages: conversation.messages.filter(
            (message) => message.id !== optimisticUser.id && message.id !== streamId,
          ),
        }));
      }
    },
    [activeConversation?.offerContext, activeConversationId, activeOfferContext, mode, updateConversationById],
  );

  const handleQuickAction = useCallback(
    (action: MessageQuickAction, t: (key: string) => string) => {
      void sendUserMessage(t(`student.internshipOffers.careerCoach.quickActions.${action}`));
    },
    [sendUserMessage],
  );

  const handlePromptClick = useCallback(
    (labelKey: string, t: (key: string) => string) => {
      void sendUserMessage(t(labelKey));
    },
    [sendUserMessage],
  );

  const handleFileSelect = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file) setPendingAttachment(file);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const selectConversation = useCallback(
    (id: string) => {
      const sessionId = normalizeSessionId(id);
      const selectedConversation = conversations.find(
        (conversation) => normalizeSessionId(conversation.id) === sessionId,
      );
      const needsOfferContextHydration =
        !selectedConversation?.offerContext &&
        !resolveOfferContextForSession(sessionId, selectedConversation?.offerContext);
      if (needsOfferContextHydration) {
        historyLoadedRef.current.delete(sessionId);
      }
      setActiveConversationId(sessionId);
      persistActiveSessionId(sessionId);
      setChatInput('');
      setPendingAttachment(null);
      if (!historyLoadedRef.current.has(sessionId)) {
        setIsHistoryLoading(true);
      }
      void loadHistory(sessionId).catch(() => setApiUnavailable(true));
    },
    [conversations, loadHistory],
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      updateConversationById(id, (conversation) => ({
        ...conversation,
        title: trimmed,
        updatedAt: Date.now(),
      }));

      try {
        await renameCareerCoachSession(id, trimmed);
        setApiUnavailable(false);
      } catch {
        setApiUnavailable(true);
        await refreshSessions(false).catch(() => undefined);
      }
    },
    [refreshSessions, updateConversationById],
  );

  const archiveConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => {
        const next = prev.map((conversation) =>
          conversation.id === id
            ? { ...conversation, archived: true, updatedAt: Date.now() }
            : conversation,
        );
        setActiveConversationId((activeId) => resolveNextActiveId(next, id, activeId));
        return next;
      });
      setChatInput('');
      setPendingAttachment(null);

      try {
        await setCareerCoachSessionArchived(id, true);
        setApiUnavailable(false);
      } catch {
        setApiUnavailable(true);
        await refreshSessions(false).catch(() => undefined);
      }
    },
    [refreshSessions, resolveNextActiveId],
  );

  const unarchiveConversation = useCallback(
    async (id: string) => {
      updateConversationById(id, (conversation) => ({
        ...conversation,
        archived: false,
        updatedAt: Date.now(),
      }));

      try {
        await setCareerCoachSessionArchived(id, false);
        setApiUnavailable(false);
      } catch {
        setApiUnavailable(true);
        await refreshSessions(true).catch(() => undefined);
      }
    },
    [refreshSessions, updateConversationById],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      historyLoadedRef.current.delete(id);
      removeOfferContextForSession(normalizeSessionId(id));

      setConversations((prev) => {
        const filtered = prev.filter((conversation) => conversation.id !== id);
        if (filtered.length === 0) {
          void (async () => {
            try {
              const created = await createCareerCoachSession();
              mergeSessions([created]);
              setActiveConversationId(normalizeSessionId(created.session_id));
              setApiUnavailable(false);
            } catch {
              setApiUnavailable(true);
            }
          })();
          return [];
        }

        setActiveConversationId((activeId) => resolveNextActiveId(filtered, id, activeId));
        return filtered;
      });

      setChatInput('');
      setPendingAttachment(null);

      try {
        await deleteCareerCoachSession(id);
        setApiUnavailable(false);
      } catch {
        setApiUnavailable(true);
        await refreshSessions(false).catch(() => undefined);
      }
    },
    [mergeSessions, refreshSessions, resolveNextActiveId],
  );

  const toggleArchivedView = useCallback(() => {
    setShowArchived((value) => !value);
  }, []);

  const startNewConversation = useCallback(async (offerContext?: CoachOfferContext) => {
    setShowArchived(false);
    setChatInput('');
    setPendingAttachment(null);

    try {
      const offerTitle = offerContext?.title?.trim();
      const created = await createCareerCoachSession(mode, offerTitle || '');
      const mapped = {
        ...mapSessionDto(created),
        title: offerTitle || mapSessionDto(created).title,
        offerContext,
      };
      setConversations((prev) => [mapped, ...prev.filter((conversation) => conversation.id !== mapped.id)]);
      const createdSessionId = normalizeSessionId(created.session_id);
      setActiveConversationId(createdSessionId);
      persistActiveSessionId(createdSessionId);
      historyLoadedRef.current.add(createdSessionId);
      setApiUnavailable(false);
      persistOfferContextForSession(createdSessionId, offerContext);

      return createdSessionId;
    } catch {
      setApiUnavailable(true);
      return undefined;
    }
  }, [mode]);

  return {
    context,
    modeConfig,
    mode,
    activeOfferContext,
    setMode,
    messages,
    conversations: useMemo(
      () =>
        dedupeConversationsById(conversations)
          .filter((conversation) => !conversation.archived)
          .sort((a, b) => b.updatedAt - a.updatedAt),
      [conversations],
    ),
    archivedConversations: useMemo(
      () =>
        dedupeConversationsById(conversations)
          .filter((conversation) => conversation.archived)
          .sort((a, b) => b.updatedAt - a.updatedAt),
      [conversations],
    ),
    showArchived,
    toggleArchivedView,
    activeConversationId,
    selectConversation,
    renameConversation,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    startNewConversation,
    chatInput,
    setChatInput,
    isSessionsLoading,
    isHistoryLoading,
    isTyping: messages.some((message) => message.isStreaming && !message.text?.trim()),
    pendingAttachment,
    setPendingAttachment,
    isDragging,
    setIsDragging,
    apiUnavailable,
    sendUserMessage,
    handleQuickAction,
    handlePromptClick,
    handleFileSelect,
    handleDrop,
  };
}
