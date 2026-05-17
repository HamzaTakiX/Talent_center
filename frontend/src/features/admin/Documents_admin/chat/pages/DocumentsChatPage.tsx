import { FunctionComponent } from 'react';
import { useAdminChatChannel } from '../../../i18n/useAdminCopy';
import { useAdminChatMockData } from '../../../i18n/useAdminChatMockData';
import AdminModuleChat from '../../../shared/admin-module-chat/AdminModuleChat';
import { documentsParticipants, documentsInitialMessages } from '../data/documentsChatMock';

const DocumentsChatPage: FunctionComponent = () => {
  const chat = useAdminChatChannel('documents');
  const mock = useAdminChatMockData('documents', documentsParticipants, documentsInitialMessages);

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

export default DocumentsChatPage;
