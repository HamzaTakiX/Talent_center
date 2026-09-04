import { FunctionComponent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import {
  type SupportInboxLayoutProps,
} from '../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import PlatformDeskSupportInbox from '../../../admin/shared/platform-desk-chat/components/PlatformDeskSupportInbox';
import EncadrantSupervisionContextPanel from '../../../admin/encadrant/chat/components/EncadrantSupervisionContextPanel';
import { buildTaskEntityRef } from '../../../shared/contextual-chat/utils/supervisionEntityChat';
import EncadrantLayout from '../../components/EncadrantLayout';

const EncadrantPortalChatLayout: FunctionComponent<SupportInboxLayoutProps> = ({
  children,
  mainFillHeight,
}) => (
  <EncadrantLayout mainFillHeight={mainFillHeight} contentFlush>
    {children}
  </EncadrantLayout>
);

const ChatPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const taskFromUrl = searchParams.get('task')?.trim() ?? '';
  const taskLabelFromUrl = searchParams.get('taskLabel')?.trim() ?? '';
  const taskMetaFromUrl = searchParams.get('taskMeta')?.trim() ?? '';
  const taskImageFromUrl = searchParams.get('taskImage')?.trim() ?? '';
  const conversationFromUrl = searchParams.get('conversation')?.trim() ?? '';
  const [pendingTaskRef, setPendingTaskRef] = useState(() =>
    taskFromUrl
      ? [buildTaskEntityRef(taskFromUrl, taskLabelFromUrl, taskMetaFromUrl, taskImageFromUrl)]
      : undefined,
  );

  useEffect(() => {
    if (!taskFromUrl) return;
    setPendingTaskRef([
      buildTaskEntityRef(taskFromUrl, taskLabelFromUrl, taskMetaFromUrl, taskImageFromUrl),
    ]);
  }, [taskFromUrl, taskLabelFromUrl, taskMetaFromUrl, taskImageFromUrl]);

  return (
    <PlatformDeskSupportInbox
      entityType="supervision_dm"
      chatModule="encadrant"
      channel="encadrants"
      viewerRole="encadrant"
      showAcademicFilters={false}
      enableAdminActions={false}
      enableArchive
      showTagAction
      supervisionMeeting={{ portal: 'encadrant' }}
      sidebarTitle={t('encadrant.nav.chat', { defaultValue: 'Chat' })}
      sidebarSubtitle={t('encadrant.chat.description', {
        defaultValue: 'Conversations avec vos étudiants assignés.',
      })}
      sidebarIcon={Users}
      searchPlaceholder={t('encadrant.common.searchConversations')}
      Layout={EncadrantPortalChatLayout}
      initialConversationId={conversationFromUrl}
      initialPendingEntities={pendingTaskRef}
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
        <EncadrantSupervisionContextPanel conversation={conversation} viewerRole="encadrant" />
      )}
    />
  );
};

export default ChatPage;
