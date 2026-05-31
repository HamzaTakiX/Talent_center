import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentModuleChat from '../components/StudentModuleChat';
import {
  studentInternshipChatInitialMessages,
  studentInternshipChatParticipants,
} from '../data/studentInternshipChatMock';

const ChatPage: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <StudentModuleChat
      participantsSeed={studentInternshipChatParticipants}
      initialMessages={studentInternshipChatInitialMessages}
      participantSubtitle={t('student.internshipOffers.chat.online')}
      searchPlaceholder={t('student.internshipOffers.chat.search')}
      composerPlaceholder={t('student.internshipOffers.chat.composer')}
      emptyConversationLabel={t('student.internshipOffers.chat.empty')}
    />
  );
};

export default ChatPage;
