import { FunctionComponent } from 'react';
import { useAdminChatChannel } from '../../../i18n/useAdminCopy';
import { useAdminChatMockData } from '../../../i18n/useAdminChatMockData';
import AdminModuleChat from '../../../shared/admin-module-chat/AdminModuleChat';
import {
  internshipOffersParticipants,
  internshipOffersInitialMessages,
} from '../data/internshipOffersChatMock';

const InternshipOffersChatPage: FunctionComponent = () => {
  const chat = useAdminChatChannel('offers');
  const mock = useAdminChatMockData('offers', internshipOffersParticipants, internshipOffersInitialMessages);

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

export default InternshipOffersChatPage;
