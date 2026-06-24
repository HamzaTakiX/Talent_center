import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import PlatformDeskSupportInbox from '../../shared/platform-desk-chat/components/PlatformDeskSupportInbox';
import AdminDeskContextPanel from './AdminDeskContextPanel';

const AdminDeskSupportInbox: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <PlatformDeskSupportInbox
      entityType="admin_desk"
      channel="admins"
      viewerRole="admin"
      showAcademicFilters={false}
      renderContextPanel={(conversation, onOpenProfile) => (
        <AdminDeskContextPanel
          conversation={conversation}
          onOpenAdministrator={
            onOpenProfile ??
            (conversation.userId
              ? () => navigate(`/admin/admins/${conversation.userId}/edit`)
              : undefined)
          }
        />
      )}
    />
  );
};

export default AdminDeskSupportInbox;
