import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { adminEncadrantsApi } from '../../../api/encadrants';
import { useOptionalAdminToast } from '../../../dashboard/context/AdminToastContext';
import PlatformDeskSupportInbox from '../../../shared/platform-desk-chat/components/PlatformDeskSupportInbox';
import EncadrantSupervisionContextPanel from './EncadrantSupervisionContextPanel';

const EncadrantSupportInbox: FunctionComponent = () => {
  const { t } = useTranslation();
  const toast = useOptionalAdminToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationFromUrl = searchParams.get('conversation') ?? '';
  const encadrantFromUrl = searchParams.get('encadrant') ?? '';
  const isOpeningFromEncadrant =
    searchParams.get('opening') === '1' && encadrantFromUrl.trim() !== '';
  const [openingEncadrantChat, setOpeningEncadrantChat] = useState(false);
  const [pendingConversationId, setPendingConversationId] = useState('');
  const openingAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    const encadrantParam = searchParams.get('encadrant')?.trim() ?? '';
    const shouldOpen = searchParams.get('opening') === '1' && encadrantParam !== '';

    if (!shouldOpen) {
      openingAttemptRef.current = null;
      return;
    }

    if (openingAttemptRef.current === encadrantParam) return;
    openingAttemptRef.current = encadrantParam;

    const encadrantId = Number(encadrantParam);
    if (!Number.isFinite(encadrantId)) {
      const next = new URLSearchParams(searchParams);
      next.delete('encadrant');
      next.delete('opening');
      setSearchParams(next, { replace: true });
      return;
    }

    let cancelled = false;
    setOpeningEncadrantChat(true);

    void adminEncadrantsApi
      .openChat(encadrantId)
      .then(({ conversation_id }) => {
        if (cancelled) return;
        setPendingConversationId(String(conversation_id));
        const next = new URLSearchParams(searchParams);
        next.delete('encadrant');
        next.delete('opening');
        next.set('conversation', String(conversation_id));
        setSearchParams(next, { replace: true });
      })
      .catch(() => {
        if (cancelled) return;
        toast.showToast(t('admin.common.detailModal.student.chatOpenError'), 'error');
        const next = new URLSearchParams(searchParams);
        next.delete('encadrant');
        next.delete('opening');
        setSearchParams(next, { replace: true });
      })
      .finally(() => {
        if (!cancelled) setOpeningEncadrantChat(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams, t, toast]);

  const effectiveConversationId = conversationFromUrl || pendingConversationId;

  return (
    <PlatformDeskSupportInbox
      entityType="encadrant_desk"
      channel="encadrants"
      viewerRole="admin"
      showAcademicFilters
      showTagAction
      chatModule="encadrant"
      sidebarTitle="Conversations"
      sidebarSubtitle="Supervision encadrants"
      sidebarIcon={Users}
      initialConversationId={effectiveConversationId}
      forceOpeningConversation={
        openingEncadrantChat || (isOpeningFromEncadrant && !effectiveConversationId)
      }
      onInitialConversationHandled={() => {
        const convId = searchParams.get('conversation');
        if (!convId) return;
        setPendingConversationId(convId);
        const next = new URLSearchParams(searchParams);
        next.delete('conversation');
        setSearchParams(next, { replace: true });
      }}
      renderContextPanel={(conversation, onOpenProfile) => (
        <EncadrantSupervisionContextPanel
          conversation={conversation}
          onOpenEncadrant={onOpenProfile}
        />
      )}
    />
  );
};

export default EncadrantSupportInbox;
