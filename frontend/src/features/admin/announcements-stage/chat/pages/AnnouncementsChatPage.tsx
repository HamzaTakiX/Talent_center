import { FunctionComponent } from 'react';
import { useAdminChatChannel } from '../../../i18n/useAdminCopy';
import { useAdminChatMockData } from '../../../i18n/useAdminChatMockData';
import AdminModuleChat from '../../../shared/admin-module-chat/AdminModuleChat';
import {
  announcementsParticipants,
  announcementsInitialMessages,
} from '../data/announcementsChatMock';

const AnnouncementsChatPage: FunctionComponent = () => {
  const chat = useAdminChatChannel('announcements');
  const mock = useAdminChatMockData(
    'announcements',
    announcementsParticipants,
    announcementsInitialMessages
  );

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

export default AnnouncementsChatPage;
