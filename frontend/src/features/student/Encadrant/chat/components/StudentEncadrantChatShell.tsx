import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, UserCheck } from 'lucide-react';
import SupportInboxShell, {
  type SupportInboxLayoutProps,
} from '../../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import PlatformDeskSupportInbox from '../../../../admin/shared/platform-desk-chat/components/PlatformDeskSupportInbox';
import EncadrantSupervisionContextPanel from '../../../../admin/encadrant/chat/components/EncadrantSupervisionContextPanel';
import {
  InternshipChatSidebarSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import { buildTaskEntityRef } from '../../../../shared/contextual-chat/utils/supervisionEntityChat';
import StudentLayout from '../../../components/StudentLayout';
import { studentEncadrantChatApi } from '../services/studentEncadrantChatApi';

const StudentEncadrantChatLayout: FunctionComponent<SupportInboxLayoutProps> = ({
  children,
  mainFillHeight,
}) => (
  <StudentLayout mainFillHeight={mainFillHeight} contentFlush>
    {children}
  </StudentLayout>
);

const StudentEncadrantChatShell: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const taskFromUrl = searchParams.get('task')?.trim() ?? '';
  const taskLabelFromUrl = searchParams.get('taskLabel')?.trim() ?? '';
  const taskMetaFromUrl = searchParams.get('taskMeta')?.trim() ?? '';
  const taskImageFromUrl = searchParams.get('taskImage')?.trim() ?? '';
  const conversationFromUrl = searchParams.get('conversation')?.trim() ?? '';
  const [ready, setReady] = useState(false);
  const [openedConversationId, setOpenedConversationId] = useState('');
  const [pendingTaskRef, setPendingTaskRef] = useState(() =>
    taskFromUrl
      ? [buildTaskEntityRef(taskFromUrl, taskLabelFromUrl, taskMetaFromUrl, taskImageFromUrl)]
      : undefined,
  );
  const [noAssignedEncadrant, setNoAssignedEncadrant] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskFromUrl) return;
    setPendingTaskRef([
      buildTaskEntityRef(taskFromUrl, taskLabelFromUrl, taskMetaFromUrl, taskImageFromUrl),
    ]);
  }, [taskFromUrl, taskLabelFromUrl, taskMetaFromUrl, taskImageFromUrl]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setOpenError(null);
    setNoAssignedEncadrant(false);

    void studentEncadrantChatApi
      .openChat()
      .then((result) => {
        if (cancelled) return;
        setOpenedConversationId(String(result.conversation_id));
        setReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';
        if (/no assigned encadrant|not assigned/i.test(message)) {
          setNoAssignedEncadrant(true);
        } else {
          setOpenError(
            t('student.encadrant.chat.loadError', {
              defaultValue: 'Impossible de charger le chat avec votre encadrant.',
            }),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  const shouldFocusConversation = Boolean(taskFromUrl || conversationFromUrl);
  const initialConversationId = useMemo(() => {
    if (conversationFromUrl) return conversationFromUrl;
    if (shouldFocusConversation) return openedConversationId;
    return '';
  }, [conversationFromUrl, openedConversationId, shouldFocusConversation]);

  if (noAssignedEncadrant || openError) {
    return (
      <StudentLayout mainFillHeight contentFlush>
        <section className="flex h-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <MessageSquare className="h-10 w-10 text-[var(--admin-text-muted)]" strokeWidth={1.5} />
          <h2 className="text-base font-semibold text-[var(--admin-text)]">
            {openError
              ? t('student.encadrant.chat.loadErrorTitle', {
                  defaultValue: 'Chat indisponible',
                })
              : t('student.encadrant.chat.noAssignedTitle', {
                  defaultValue: 'Pas d’encadrant assigné',
                })}
          </h2>
          <p className="max-w-sm text-sm text-[var(--admin-text-secondary)]">
            {openError ??
              t('student.encadrant.chat.noAssigned', {
                defaultValue: 'Aucun encadrant ne vous est assigné pour le moment.',
              })}
          </p>
        </section>
      </StudentLayout>
    );
  }

  if (!ready) {
    return (
      <SupportInboxShell
        Layout={StudentEncadrantChatLayout}
        hasSelection={shouldFocusConversation}
        mobileView={shouldFocusConversation ? 'chat' : 'list'}
        sidebar={<InternshipChatSidebarSkeleton />}
        workspace={<InternshipChatWorkspaceSkeleton />}
      />
    );
  }

  return (
    <PlatformDeskSupportInbox
      entityType="supervision_dm"
      chatModule="encadrant"
      channel="encadrants"
      viewerRole="student"
      showAcademicFilters={false}
      enableAdminActions={false}
      enableArchive={false}
      showTagAction
      supervisionMeeting={{ portal: 'student' }}
      sidebarTitle={t('student.encadrant.chat.sidebarTitle', { defaultValue: 'Conversations' })}
      sidebarSubtitle={t('student.encadrant.chat.sidebarSubtitle', {
        defaultValue: 'Supervision encadrant',
      })}
      sidebarIcon={UserCheck}
      searchPlaceholder={t('student.encadrant.chat.search', {
        defaultValue: 'Rechercher…',
      })}
      Layout={StudentEncadrantChatLayout}
      initialConversationId={initialConversationId}
      initialPendingEntities={pendingTaskRef}
      forceOpeningConversation={shouldFocusConversation && !initialConversationId}
      onInitialConversationHandled={() => {
        if (!taskFromUrl && !conversationFromUrl) return;
        const next = new URLSearchParams(searchParams);
        next.delete('conversation');
        next.delete('task');
        next.delete('taskLabel');
        next.delete('taskMeta');
        next.delete('taskImage');
        setSearchParams(next, { replace: true });
      }}
      renderContextPanel={(conversation) => (
        <EncadrantSupervisionContextPanel conversation={conversation} viewerRole="student" />
      )}
    />
  );
};

export default StudentEncadrantChatShell;
