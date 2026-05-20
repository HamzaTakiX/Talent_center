import { FunctionComponent } from 'react';
import StudentModuleChat from '../../../internship_offers/chat/components/StudentModuleChat';
import {
  studentSrfChatInitialMessages,
  studentSrfChatParticipants,
} from '../data/studentSrfChatMock';

const ChatPage: FunctionComponent = () => (
  <StudentModuleChat
    participantsSeed={studentSrfChatParticipants}
    initialMessages={studentSrfChatInitialMessages}
    participantSubtitle="finance desk"
    searchPlaceholder="Search payments or conversations"
    composerPlaceholder="Write a message about your payment or receipt..."
    emptyConversationLabel="Select a conversation about your fees and payments"
  />
);

export default ChatPage;
