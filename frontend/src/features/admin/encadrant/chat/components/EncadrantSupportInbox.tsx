import { FunctionComponent } from 'react';
import { useAdminChatMockData } from '../../../i18n/useAdminChatMockData';
import DeskSupportInbox from '../../../shared/admin-support-inbox/components/DeskSupportInbox';
import { encadrantParticipants, encadrantInitialMessages } from '../data/encadrantChatMock';
import EncadrantSupervisionContextPanel from './EncadrantSupervisionContextPanel';

const EncadrantSupportInbox: FunctionComponent = () => {
  const mock = useAdminChatMockData('encadrants', encadrantParticipants, encadrantInitialMessages);

  return (
    <DeskSupportInbox
      channel="encadrants"
      participants={mock.participants}
      initialMessages={mock.messages}
      renderContextPanel={(conversation) => (
        <EncadrantSupervisionContextPanel conversation={conversation} />
      )}
    />
  );
};

export default EncadrantSupportInbox;
