import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentModuleChat from '../../../internship_offers/chat/components/StudentModuleChat';
import {
  studentAnnouncementsChatInitialMessages,
  studentAnnouncementsChatParticipants,
} from '../data/studentAnnouncementsChatMock';

const ChatPage: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <StudentModuleChat
      participantsSeed={studentAnnouncementsChatParticipants}
      initialMessages={studentAnnouncementsChatInitialMessages}
      participantSubtitle={t('student.announcements.chat.desk')}
      searchPlaceholder={t('student.announcements.chat.search')}
      composerPlaceholder={t('student.announcements.chat.composer')}
      emptyConversationLabel={t('student.announcements.chat.empty')}
    />
  );
};

export default ChatPage;
