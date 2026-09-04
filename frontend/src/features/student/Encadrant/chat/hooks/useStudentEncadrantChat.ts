import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import type { SupportMobileView } from '../../../../admin/shared/admin-support-inbox/types/supportInboxTypes';
import {
  applySmartAction,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendChatMessage,
} from '../../../../shared/contextual-chat/api/chatApi';
import { useChatUnread } from '../../../../shared/contextual-chat/context/ChatUnreadContext';
import { useChatWebSocket } from '../../../../shared/contextual-chat/hooks/useChatWebSocket';
import type { ConversationDto, MessageDto } from '../../../../shared/contextual-chat/types';
import {
  isPendingLocalMessage,
  mergeServerMessages,
  withClientNonce,
} from '../../../../admin/offres-stage/chat/utils/internshipChatMessageUtils';
import { mapAnnouncementMessages } from '../../../../admin/announcements-stage/chat/utils/announcementChatMappers';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { studentEncadrantChatApi } from '../services/studentEncadrantChatApi';

function formatRelativeTime(iso: string | null | undefined, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: 'short' }).format(d);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? 'EN').toUpperCase();
}

function isNoAssignedEncadrantError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const payload = err.response?.data as { message?: string } | undefined;
    const message = payload?.message ?? err.message ?? '';
    if (status === 403 || status === 404) {
      return /encadrant|assigned|supervision/i.test(message) || Boolean(status === 403);
    }
    return /no assigned encadrant/i.test(message);
  }
  if (err instanceof Error) {
    return /no assigned encadrant|not assigned/i.test(err.message);
  }
  return false;
}

export function useStudentEncadrantChat() {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const studentUserId = user?.id ?? null;
  const { refresh: refreshChatUnread } = useChatUnread();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [rawConversation, setRawConversation] = useState<ConversationDto | null>(null);
  const [rawMessages, setRawMessages] = useState<MessageDto[]>([]);
  const [encadrantName, setEncadrantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noAssignedEncadrant, setNoAssignedEncadrant] = useState(false);
  const [archived, setArchived] = useState(false);
  const [mobileView, setMobileView] = useState<SupportMobileView>('chat');
  const rawMessagesRef = useRef(rawMessages);
  rawMessagesRef.current = rawMessages;
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;
  const refreshMessagesRef = useRef<(id: number, options?: { silent?: boolean }) => Promise<void>>(
    async () => undefined,
  );

  const loadMessages = useCallback(
    async (id: number, options?: { silent?: boolean }) => {
      try {
        const items = await fetchMessages(id);
        setRawMessages((prev) => {
          const next = options?.silent ? mergeServerMessages(prev, items) : items;
          rawMessagesRef.current = next;
          return next;
        });
        const last = items[items.length - 1];
        if (last) {
          void markConversationRead(id, last.id).then(() => {
            void refreshChatUnread();
          });
        }
      } catch {
        if (!options?.silent) {
          setLoadError(
            t('student.encadrant.chat.loadError', {
              defaultValue: 'Impossible de charger les messages.',
            }),
          );
        }
      }
    },
    [refreshChatUnread, t],
  );

  useEffect(() => {
    refreshMessagesRef.current = loadMessages;
  }, [loadMessages]);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNoAssignedEncadrant(false);
    try {
      const open = await studentEncadrantChatApi.openChat();
      const id = open.conversation_id;
      setConversationId(id);
      setEncadrantName(open.encadrant_name || '');

      const items = await fetchConversations('encadrant', { includeArchived: true });
      const dto =
        items.find((item) => item.id === id) ??
        items.find((item) => item.context?.entity_type === 'supervision_dm') ??
        null;
      setRawConversation(dto);

      const snap = (dto?.context?.context_snapshot_json ?? {}) as Record<string, unknown>;
      const nameFromSnap =
        typeof snap.encadrant_name === 'string' ? snap.encadrant_name : '';
      if (nameFromSnap) setEncadrantName(nameFromSnap);
      else if (dto?.context?.entity_label) setEncadrantName(dto.context.entity_label);

      setArchived(Boolean(dto?.is_archived));
      await loadMessages(id);
    } catch (err) {
      if (isNoAssignedEncadrantError(err)) {
        setNoAssignedEncadrant(true);
        setConversationId(null);
        setRawConversation(null);
        setRawMessages([]);
      } else {
        setLoadError(
          t('student.encadrant.chat.loadError', {
            defaultValue: 'Impossible de charger le chat avec votre encadrant.',
          }),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [loadMessages, t]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useChatWebSocket({
    conversationId,
    enabled: conversationId != null,
    onEvent: (event) => {
      const activeId = conversationIdRef.current;
      if (!activeId || event.conversation_id !== activeId) return;

      if (event.event_type === 'message.created') {
        const cached = rawMessagesRef.current;
        const messageId = event.message_id;
        const hasMessage = messageId != null && cached.some((message) => message.id === messageId);
        const hasPendingOwn = cached.some(
          (message) => message.is_own && isPendingLocalMessage(message),
        );
        if (hasPendingOwn) return;
        if (!hasMessage) {
          void refreshMessagesRef.current(activeId, { silent: true });
        }
        if (messageId != null && Number.isFinite(Number(messageId))) {
          void markConversationRead(activeId, Number(messageId)).then(() => {
            void refreshChatUnread();
          });
        }
        return;
      }

      if (event.event_type === 'conversation.updated') {
        void bootstrap();
      }
    },
  });

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return;
      const trimmed = text.trim();
      const optimisticId = `local-${Date.now()}`;
      const optimistic: MessageDto = withClientNonce(
        {
          id: optimisticId as unknown as number,
          conversation_id: conversationId,
          sender_id: null,
          sender_name: '',
          body: trimmed,
          message_type: 'TEXT',
          created_at: new Date().toISOString(),
          tags: [],
          is_own: true,
          metadata_json: {},
        },
        optimisticId,
      );

      setRawMessages((prev) => {
        const next = [...prev, optimistic];
        rawMessagesRef.current = next;
        return next;
      });

      try {
        const saved = await sendChatMessage(conversationId, trimmed);
        if (!saved) return;

        setRawMessages((prev) => {
          const pendingIndex = prev.findIndex(
            (message) =>
              isPendingLocalMessage(message) &&
              (message.metadata_json?.client_nonce === optimisticId ||
                String(message.id) === optimisticId),
          );
          const savedWithNonce = withClientNonce(saved, optimisticId);
          let nextList: MessageDto[];
          if (pendingIndex >= 0) {
            nextList = [...prev];
            nextList[pendingIndex] = savedWithNonce;
          } else if (prev.some((message) => message.id === saved.id)) {
            nextList = prev.map((message) =>
              message.id === saved.id ? withClientNonce(message, optimisticId) : message,
            );
          } else {
            nextList = [...prev, savedWithNonce];
          }
          rawMessagesRef.current = nextList;
          return nextList;
        });

        if (rawConversation) {
          setRawConversation({
            ...rawConversation,
            last_preview: saved.body,
            last_message_at: saved.created_at,
            last_message_is_own: true,
          });
        }

        void markConversationRead(conversationId, saved.id).then(() => {
          void refreshChatUnread();
        });
      } catch {
        setRawMessages((prev) => {
          const next = prev.filter(
            (message) =>
              !(
                isPendingLocalMessage(message) &&
                message.metadata_json?.client_nonce === optimisticId
              ),
          );
          rawMessagesRef.current = next;
          return next;
        });
      }
    },
    [conversationId, rawConversation, refreshChatUnread],
  );

  const archiveConversation = useCallback(async () => {
    if (!conversationId) return;
    setArchived(true);
    try {
      await applySmartAction(conversationId, 'archive_conversation');
    } catch {
      setArchived(false);
    }
  }, [conversationId]);

  const unarchiveConversation = useCallback(async () => {
    if (!conversationId) return;
    setArchived(false);
    try {
      await applySmartAction(conversationId, 'unarchive_conversation');
    } catch {
      setArchived(true);
    }
  }, [conversationId]);

  const messages = useMemo(
    () => mapAnnouncementMessages(rawMessages, studentUserId, 'student'),
    [rawMessages, studentUserId],
  );
  const displayName =
    encadrantName ||
    t('student.encadrant.chat.encadrantFallback', { defaultValue: 'Mon encadrant' });
  const avatarUrl =
    typeof rawConversation?.context?.context_snapshot_json?.encadrant_avatar_url === 'string'
      ? (rawConversation.context.context_snapshot_json.encadrant_avatar_url as string)
      : null;

  return {
    conversationId,
    messages,
    loading,
    loadError,
    noAssignedEncadrant,
    archived,
    mobileView,
    setMobileView,
    sendMessage,
    archiveConversation,
    unarchiveConversation,
    encadrantName: displayName,
    encadrantInitials: initialsFromName(displayName),
    avatarUrl,
    lastPreview: rawConversation?.last_preview ?? '',
    lastMessageIsOwn: Boolean(rawConversation?.last_message_is_own),
    timeLabel: formatRelativeTime(rawConversation?.last_message_at, i18n.language),
    unreadCount: rawConversation?.unread_count ?? 0,
  };
}
