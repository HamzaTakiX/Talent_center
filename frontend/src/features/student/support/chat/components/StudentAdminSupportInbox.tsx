import { FunctionComponent, ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StudentLayout from '../../../components/StudentLayout';
import type { SupportInboxLayoutProps } from '../../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import PlatformDeskSupportInbox from '../../../../admin/shared/platform-desk-chat/components/PlatformDeskSupportInbox';
import StudentSupportChatStartState from './StudentSupportChatStartState';

const StudentSupportChatLayout: FunctionComponent<SupportInboxLayoutProps> = ({
  children,
  mainFillHeight,
}) => (
  <StudentLayout mainFillHeight={mainFillHeight} contentFlush>
    {children}
  </StudentLayout>
);

const StudentAdminSupportInbox: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <PlatformDeskSupportInbox
      entityType="student_admin_dm"
      channel="students"
      viewerRole="student"
      showAcademicFilters={false}
      enableAdminActions={false}
      enableArchive={false}
      showTagAction
      chatModule="platform"
      sidebarTitle={t('student.support.chat.sidebarTitle')}
      sidebarSubtitle={t('student.support.chat.sidebarSubtitle')}
      searchPlaceholder={t('student.support.chat.searchPlaceholder')}
      sidebarIcon={MessageSquare}
      Layout={StudentSupportChatLayout}
      renderThreadEmpty={(conversation) => <StudentSupportChatStartState conversation={conversation} />}
    />
  );
};

export default StudentAdminSupportInbox;
