import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentModuleChat from '../../../internship_offers/chat/components/StudentModuleChat';
import {
  studentEncadrantChatInitialMessages,
  studentEncadrantChatParticipants,
} from '../data/studentEncadrantChatMock';

const ChatPage: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <StudentModuleChat
      participantsSeed={studentEncadrantChatParticipants}
      initialMessages={studentEncadrantChatInitialMessages}
      participantSubtitle={t('student.encadrant.chat.subtitle')}
      searchPlaceholder={t('student.encadrant.chat.search')}
      composerPlaceholder={t('student.encadrant.chat.composer')}
      emptyConversationLabel={t('student.encadrant.chat.empty')}
    />
  );
};

export default ChatPage;
