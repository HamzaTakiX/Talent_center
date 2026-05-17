import { FunctionComponent } from 'react';
import { useAdminChatChannel } from '../../i18n/useAdminCopy';
import { useAdminChatMockData } from '../../i18n/useAdminChatMockData';
import AdminModuleChat from '../../shared/admin-module-chat/AdminModuleChat';
import { sousAdminParticipants, sousAdminInitialMessages } from '../data/sousAdminChatMock';

const SousAdminChatPage: FunctionComponent = () => {
  const chat = useAdminChatChannel('admins');
  const mock = useAdminChatMockData('admins', sousAdminParticipants, sousAdminInitialMessages);

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

export default SousAdminChatPage;
