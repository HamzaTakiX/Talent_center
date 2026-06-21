import { FunctionComponent } from 'react';
import { useAdminChatMockData } from '../../../i18n/useAdminChatMockData';
import DeskSupportInbox from '../../../shared/admin-support-inbox/components/DeskSupportInbox';
import { studentDeskParticipants, studentDeskInitialMessages } from '../data/studentChatMock';

const StudentDeskSupportInbox: FunctionComponent = () => {
  const mock = useAdminChatMockData('students', studentDeskParticipants, studentDeskInitialMessages);

  return (
    <DeskSupportInbox
      channel="students"
      participants={mock.participants}
      initialMessages={mock.messages}
    />
  );
};

export default StudentDeskSupportInbox;
