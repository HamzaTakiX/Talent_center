import { FunctionComponent, ReactNode } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import type { SupportInboxLayoutProps } from '../../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import PlatformDeskSupportInbox from '../../../../admin/shared/platform-desk-chat/components/PlatformDeskSupportInbox';
import StudentAdminContextPanel from './StudentAdminContextPanel';

const StudentSupportChatLayout: FunctionComponent<SupportInboxLayoutProps> = ({
  children,
  mainFillHeight,
}) => (
  <StudentLayout mainFillHeight={mainFillHeight} contentFlush>
    {children}
  </StudentLayout>
);

const StudentAdminSupportInbox: FunctionComponent = () => (
  <PlatformDeskSupportInbox
    entityType="student_admin_dm"
    channel="students"
    viewerRole="student"
    showAcademicFilters={false}
    enableAdminActions={false}
    Layout={StudentSupportChatLayout}
    renderContextPanel={(conversation) => <StudentAdminContextPanel conversation={conversation} />}
  />
);

export default StudentAdminSupportInbox;
