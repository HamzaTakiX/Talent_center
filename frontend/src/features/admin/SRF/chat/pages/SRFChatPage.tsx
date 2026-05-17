import { FunctionComponent } from 'react';
import { useAdminChatChannel } from '../../../i18n/useAdminCopy';
import { useAdminChatMockData } from '../../../i18n/useAdminChatMockData';
import AdminModuleChat from '../../../shared/admin-module-chat/AdminModuleChat';
import { srfParticipants, srfInitialMessages } from '../data/srfChatMock';

const SRFChatPage: FunctionComponent = () => {
  const chat = useAdminChatChannel('srf');
  const mock = useAdminChatMockData('srf', srfParticipants, srfInitialMessages);

  return (
    <AdminModuleChat
      participantsSeed={mock.participants}
      initialMessages={mock.messages}
      participantSubtitle={chat.participantSubtitle}
      searchPlaceholder={chat.searchPlaceholder}
      composerPlaceholder={chat.composerPlaceholder}
      emptyConversationLabel={chat.emptyConversationLabel}
    />
  );
};

export default SRFChatPage;
