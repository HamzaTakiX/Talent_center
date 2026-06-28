import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { adminStudentsApi } from '../../../api/students';
import { useOptionalAdminToast } from '../../../dashboard/context/AdminToastContext';
import PlatformDeskSupportInbox from '../../../shared/platform-desk-chat/components/PlatformDeskSupportInbox';
import StudentDeskContextPanel from './StudentDeskContextPanel';

const StudentDeskSupportInbox: FunctionComponent = () => {
  const { t } = useTranslation();
  const toast = useOptionalAdminToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationFromUrl = searchParams.get('conversation') ?? '';
  const studentFromUrl = searchParams.get('student') ?? '';
  const isOpeningFromStudent = searchParams.get('opening') === '1' && studentFromUrl.trim() !== '';
  const [openingStudentChat, setOpeningStudentChat] = useState(false);
  const [pendingConversationId, setPendingConversationId] = useState('');
  const openingAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    const studentParam = searchParams.get('student')?.trim() ?? '';
    const shouldOpen = searchParams.get('opening') === '1' && studentParam !== '';

    if (!shouldOpen) {
      openingAttemptRef.current = null;
      return;
    }

    if (openingAttemptRef.current === studentParam) return;
    openingAttemptRef.current = studentParam;

    const studentId = Number(studentParam);
    if (!Number.isFinite(studentId)) {
      const next = new URLSearchParams(searchParams);
      next.delete('student');
      next.delete('opening');
      setSearchParams(next, { replace: true });
      return;
    }

    let cancelled = false;
    setOpeningStudentChat(true);

    void adminStudentsApi
      .openChat(studentId)
      .then(({ conversation_id }) => {
        if (cancelled) return;
        setPendingConversationId(String(conversation_id));
        const next = new URLSearchParams(searchParams);
        next.delete('student');
        next.delete('opening');
        next.set('conversation', String(conversation_id));
        setSearchParams(next, { replace: true });
      })
      .catch(() => {
        if (cancelled) return;
        toast.showToast(t('admin.common.detailModal.student.chatOpenError'), 'error');
        const next = new URLSearchParams(searchParams);
        next.delete('student');
        next.delete('opening');
        setSearchParams(next, { replace: true });
      })
      .finally(() => {
        if (!cancelled) setOpeningStudentChat(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams, t, toast]);

  const effectiveConversationId = conversationFromUrl || pendingConversationId;

  return (
    <PlatformDeskSupportInbox
      entityType="student_admin_dm"
      channel="students"
      viewerRole="admin"
      showAcademicFilters
      initialConversationId={effectiveConversationId}
      forceOpeningConversation={
        openingStudentChat || (isOpeningFromStudent && !effectiveConversationId)
      }
      onInitialConversationHandled={() => {
        if (!searchParams.has('conversation')) return;
        const next = new URLSearchParams(searchParams);
        next.delete('conversation');
        setSearchParams(next, { replace: true });
      }}
      renderContextPanel={(conversation, onOpenProfile) => (
        <StudentDeskContextPanel conversation={conversation} onOpenStudent={onOpenProfile} />
      )}
    />
  );
};

export default StudentDeskSupportInbox;
