import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

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

import { mapSrfMessages, mapSnapshotToFinancialSidebar } from '../../../../admin/SRF/chat/utils/srfChatMappers';

import { studentSrfApi } from '../../services/studentSrfApi';

import type { SrfChatMessage, SrfFinancialObligation, SrfFinancialSummary } from '../types';



type SidebarFinancial = {

  financialSummary: SrfFinancialSummary;

  obligations: SrfFinancialObligation[];

  upcomingDeadline: { label: string };

};



const EMPTY_SIDEBAR: SidebarFinancial = {

  financialSummary: { totalDue: 0, totalPaid: 0, totalRemaining: 0 },

  obligations: [],

  upcomingDeadline: { label: '—' },

};



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



export function useStudentSrfChat() {

  const { i18n } = useTranslation();

  const { refresh: refreshChatUnread } = useChatUnread();

  const [conversationId, setConversationId] = useState<number | null>(null);

  const [rawConversation, setRawConversation] = useState<ConversationDto | null>(null);

  const [rawMessages, setRawMessages] = useState<MessageDto[]>([]);

  const [sidebar, setSidebar] = useState<SidebarFinancial>(EMPTY_SIDEBAR);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [archived, setArchived] = useState(false);

  const [mobileView, setMobileView] = useState<SupportMobileView>('list');

  const rawMessagesRef = useRef(rawMessages);

  rawMessagesRef.current = rawMessages;

  const conversationIdRef = useRef(conversationId);

  conversationIdRef.current = conversationId;

  const studentUserId = rawConversation?.context?.student_user_id ?? null;



  const messages = useMemo(

    () => mapSrfMessages(rawMessages, studentUserId, 'student') as SrfChatMessage[],

    [rawMessages, studentUserId],

  );



  const refreshSidebarFromDetail = useCallback(async () => {

    try {

      const detail = await studentSrfApi.getMyFinancialDetail();

      const account = detail.account;

      const obligations: SrfFinancialObligation[] = (detail.account.installments ?? []).map(

        (inst) => ({

          id: String(inst.id),

          title: inst.label || `Tranche ${inst.installment_number}`,

          status: inst.payment_status === 'PAID' ? 'paid' : 'unpaid',

          detail: `${inst.amount} ${account.currency}`,

        }),

      );

      const nextUnpaid = (detail.account.installments ?? []).find(

        (inst) => inst.payment_status !== 'PAID',

      );

      setSidebar({

        financialSummary: {

          totalDue: Number(account.total_amount) || 0,

          totalPaid: Number(account.paid_amount) || 0,

          totalRemaining: Number(account.remaining_amount) || 0,

        },

        obligations,

        upcomingDeadline: nextUnpaid

          ? {

              label: `${nextUnpaid.due_date ?? '—'} — ${nextUnpaid.amount} ${account.currency}`,

            }

          : { label: '—' },

      });

    } catch {

      /* keep snapshot from conversation if detail fails */

    }

  }, []);



  const loadMessages = useCallback(

    async (id: number, options?: { silent?: boolean }) => {

      const fetched = await fetchMessages(id);

      setRawMessages((prev) => {

        const merged = mergeServerMessages(prev, fetched);

        rawMessagesRef.current = merged;

        return merged;

      });

      const last = fetched[fetched.length - 1];

      if (last) {

        await markConversationRead(id, last.id);

        void refreshChatUnread();

      }

    },

    [refreshChatUnread],

  );



  const refreshMessagesRef = useRef<(id: number, options?: { silent?: boolean }) => Promise<void>>(

    async () => undefined,

  );



  useEffect(() => {

    refreshMessagesRef.current = loadMessages;

  }, [loadMessages]);



  const bootstrap = useCallback(async () => {

    setLoading(true);

    setLoadError(null);

    try {

      const open = await studentSrfApi.openChat();

      const id = open.conversation_id;

      setConversationId(id);

      const items = await fetchConversations('srf', { includeArchived: true });

      const dto = items.find((item) => item.id === id) ?? null;

      setRawConversation(dto);

      const snap = (dto?.context?.context_snapshot_json ?? {}) as Record<string, unknown>;

      if (Object.keys(snap).length) {

        setSidebar(mapSnapshotToFinancialSidebar(snap));

      }

      setArchived(Boolean(dto?.is_archived || dto?.metadata_json?.student_archived_by));

      await loadMessages(id);

      void refreshSidebarFromDetail();

    } catch {

      setLoadError('Impossible de charger le chat SRF.');

    } finally {

      setLoading(false);

    }

  }, [loadMessages, refreshSidebarFromDetail]);



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

    async (text: string, tagCodes?: string[], entityRefs?: import('../../../../shared/contextual-chat/types/chatEntityTypes').ChatEntityReference[]) => {

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

        const saved = await sendChatMessage(conversationId, trimmed, tagCodes, undefined, entityRefs);

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



  const timeLabel = useMemo(

    () => formatRelativeTime(rawConversation?.last_message_at, i18n.language),

    [rawConversation?.last_message_at, i18n.language],

  );



  return {

    conversationId,

    messages,

    sidebar,

    loading,

    loadError,

    archived,

    mobileView,

    lastPreview: rawConversation?.last_preview ?? '',

    lastMessageIsOwn: Boolean(rawConversation?.last_message_is_own),

    unreadCount: rawConversation?.unread_count ?? 0,

    timeLabel,

    setMobileView,

    sendMessage,

    archiveConversation,

    unarchiveConversation,

    reload: bootstrap,

  };

}

