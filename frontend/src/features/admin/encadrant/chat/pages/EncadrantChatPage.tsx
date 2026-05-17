import { FunctionComponent } from 'react';
import { useAdminChatChannel } from '../../../i18n/useAdminCopy';
import { useAdminChatMockData } from '../../../i18n/useAdminChatMockData';
import AdminModuleChat from '../../../shared/admin-module-chat/AdminModuleChat';
import { encadrantParticipants, encadrantInitialMessages } from '../data/encadrantChatMock';

const EncadrantChatPage: FunctionComponent = () => {
  const chat = useAdminChatChannel('encadrants');
  const mock = useAdminChatMockData('encadrants', encadrantParticipants, encadrantInitialMessages);

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

export default EncadrantChatPage;
