import { FunctionComponent } from 'react';
import { useAdminChatMockData } from '../../i18n/useAdminChatMockData';
import DeskSupportInbox from '../../shared/admin-support-inbox/components/DeskSupportInbox';
import { sousAdminParticipants, sousAdminInitialMessages } from '../data/sousAdminChatMock';

const AdminDeskSupportInbox: FunctionComponent = () => {
  const mock = useAdminChatMockData('admins', sousAdminParticipants, sousAdminInitialMessages);

  return (
    <DeskSupportInbox
      channel="admins"
      participants={mock.participants}
      initialMessages={mock.messages}
    />
  );
};

export default AdminDeskSupportInbox;
