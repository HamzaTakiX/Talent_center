import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentModuleChat from '../../../internship_offers/chat/components/StudentModuleChat';
import {
  studentDocumentsChatInitialMessages,
  studentDocumentsChatParticipants,
} from '../data/studentDocumentsChatMock';

const ChatPage: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <StudentModuleChat
      participantsSeed={studentDocumentsChatParticipants}
      initialMessages={studentDocumentsChatInitialMessages}
      participantSubtitle={t('student.documents.chat.desk')}
      searchPlaceholder={t('student.documents.chat.search')}
      composerPlaceholder={t('student.documents.chat.composer')}
      emptyConversationLabel={t('student.documents.chat.empty')}
    />
  );
};

export default ChatPage;
