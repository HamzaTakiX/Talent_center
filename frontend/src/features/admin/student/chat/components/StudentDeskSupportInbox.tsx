import { FunctionComponent } from 'react';
import PlatformDeskSupportInbox from '../../../shared/platform-desk-chat/components/PlatformDeskSupportInbox';
import StudentDeskContextPanel from './StudentDeskContextPanel';

const StudentDeskSupportInbox: FunctionComponent = () => (
  <PlatformDeskSupportInbox
    entityType="student_admin_dm"
    channel="students"
    viewerRole="admin"
    showAcademicFilters
    renderContextPanel={(conversation, onOpenProfile) => (
      <StudentDeskContextPanel conversation={conversation} onOpenStudent={onOpenProfile} />
    )}
  />
);

export default StudentDeskSupportInbox;
