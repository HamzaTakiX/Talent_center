import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminChatMockData } from '../../i18n/useAdminChatMockData';
import DeskSupportInbox from '../../shared/admin-support-inbox/components/DeskSupportInbox';
import { sousAdminParticipants, sousAdminInitialMessages } from '../data/sousAdminChatMock';
import AdminDeskContextPanel from './AdminDeskContextPanel';

const AdminDeskSupportInbox: FunctionComponent = () => {
  const navigate = useNavigate();
  const mock = useAdminChatMockData('admins', sousAdminParticipants, sousAdminInitialMessages);

  return (
    <DeskSupportInbox
      channel="admins"
      participants={mock.participants}
      initialMessages={mock.messages}
      showQuickFilters={false}
      renderContextPanel={(conversation) => (
        <AdminDeskContextPanel
          conversation={conversation}
          onOpenAdministrator={
            conversation.userId
              ? () => navigate(`/admin/admins/${conversation.userId}/edit`)
              : undefined
          }
        />
      )}
    />
  );
};

export default AdminDeskSupportInbox;
